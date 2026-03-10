import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limit storage (fallback for development)
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// Redis client for production rate limiting
let redisClient: any = null;

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

/**
 * Initialize Redis client if REDIS_URL is available
 */
async function initRedis() {
  if (process.env.REDIS_URL && !redisClient) {
    try {
      const Redis = (await import('redis')).default;
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
      });
      
      redisClient.on('error', (err: any) => {
        console.error('Redis rate limit error:', err);
        redisClient = null; // Fallback to memory store
      });
      
      await redisClient.connect();
      console.log('Redis rate limit client connected');
    } catch (error) {
      console.warn('Redis rate limit initialization failed, using memory store:', error);
      redisClient = null;
    }
  }
}

/**
 * Generate rate limit key from request
 */
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get user ID from JWT token first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Extract user ID from JWT (simplified - in production, verify token)
      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.uid || payload.sub || payload.userId) {
        return `rate_limit:${payload.uid || payload.sub || payload.userId}`;
      }
    } catch (error) {
      // Invalid token, fall back to IP
    }
  }
  
  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
  return `rate_limit:${ip}`;
}

/**
 * Get current rate limit data
 */
async function getRateLimitData(key: string): Promise<{ count: number; resetTime: number } | null> {
  try {
    if (redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      const entry = memoryStore.get(key);
      if (entry && Date.now() < entry.resetTime) {
        return entry;
      }
      if (entry) {
        memoryStore.delete(key);
      }
      return null;
    }
  } catch (error) {
    console.warn('Rate limit get error:', error);
    return null;
  }
}

/**
 * Set rate limit data
 */
async function setRateLimitData(key: string, count: number, resetTime: number): Promise<void> {
  try {
    const data = { count, resetTime };
    const ttl = Math.floor((resetTime - Date.now()) / 1000);
    
    if (redisClient) {
      await redisClient.setEx(key, Math.max(1, ttl), JSON.stringify(data));
    } else {
      memoryStore.set(key, data);
      
      // Clean up expired entries periodically
      if (memoryStore.size > 1000) {
        const now = Date.now();
        const entries = Array.from(memoryStore.entries());
        for (const [k, entry] of entries) {
          if (now >= entry.resetTime) {
            memoryStore.delete(k);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Rate limit set error:', error);
  }
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
  const now = Date.now();
  const resetTime = now + windowMs;
  
  try {
    if (redisClient) {
      // Use Redis INCR with expiration for atomic operations
      const pipeline = redisClient.multi();
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(windowMs / 1000));
      const results = await pipeline.exec();
      const count = results?.[0]?.[1] as number || 1;
      
      return { count, resetTime };
    } else {
      // Fallback to memory store
      const existing = await getRateLimitData(key);
      const count = existing ? existing.count + 1 : 1;
      
      await setRateLimitData(key, count, resetTime);
      return { count, resetTime };
    }
  } catch (error) {
    console.warn('Rate limit increment error:', error);
    // Fallback to memory store on Redis error
    const existing = await getRateLimitData(key);
    const count = existing ? existing.count + 1 : 1;
    await setRateLimitData(key, count, resetTime);
    return { count, resetTime };
  }
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}> {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  // Initialize Redis if needed
  await initRedis();

  const key = keyGenerator(req);
  const { count, resetTime } = await incrementRateLimit(key, windowMs);

  const remaining = Math.max(0, maxRequests - count);
  const success = count <= maxRequests;

  // Calculate retry after time if rate limited
  const retryAfter = success ? undefined : Math.ceil((resetTime - Date.now()) / 1000);

  return {
    success,
    limit: maxRequests,
    remaining,
    resetTime,
    retryAfter,
  };
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (req: NextRequest): Promise<{
    success: boolean;
    response?: NextResponse;
    rateLimit?: {
      limit: number;
      remaining: number;
      resetTime: number;
      retryAfter?: number;
    };
  }> => {
    const result = await rateLimit(req, config);
    
    if (!result.success) {
      const response = NextResponse.json(
        { 
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': (result.retryAfter || 60).toString(),
          },
        }
      );
      
      return {
        success: false,
        response,
        rateLimit: result,
      };
    }
    
    return {
      success: true,
      rateLimit: result,
    };
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // AI endpoints: 20 requests per hour
  ai: createRateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  }),
  
  // Auth endpoints: 5 requests per minute
  auth: createRateLimitMiddleware({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  }),
  
  // General API: 100 requests per hour
  general: createRateLimitMiddleware({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100,
  }),
};

/**
 * Helper to add rate limit headers to successful responses
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimit: { limit: number; remaining: number; resetTime: number }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
  return response;
}
