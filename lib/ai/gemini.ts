import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache fallback (for development without Redis)
const memoryCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Redis client (will be initialized if available)
let redisClient: any = null;

interface GeminiOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  cache?: boolean;
}

interface CacheEntry {
  text: string;
  timestamp: number;
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
        console.error('Redis connection error:', err);
        redisClient = null; // Fallback to memory cache
      });
      
      await redisClient.connect();
      console.log('Redis client connected');
    } catch (error) {
      console.warn('Redis initialization failed, using memory cache:', error);
      redisClient = null;
    }
  }
}

/**
 * Generate cache key for prompt
 */
function getCacheKey(prompt: string, options: GeminiOptions = {}): string {
  const optionsStr = JSON.stringify(options);
  return `gemini:${Buffer.from(prompt + optionsStr).toString('base64').slice(0, 32)}`;
}

/**
 * Get cached response
 */
async function getCachedResponse(cacheKey: string): Promise<string | null> {
  try {
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_DURATION) {
          return entry.text;
        }
        // Expired, delete from cache
        await redisClient.del(cacheKey);
      }
    } else {
      // Fallback to memory cache
      const entry = memoryCache.get(cacheKey);
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.text;
      }
      if (entry) {
        memoryCache.delete(cacheKey);
      }
    }
  } catch (error) {
    console.warn('Cache retrieval error:', error);
  }
  
  return null;
}

/**
 * Set cached response
 */
async function setCachedResponse(cacheKey: string, text: string): Promise<void> {
  try {
    const entry: CacheEntry = {
      text,
      timestamp: Date.now(),
    };
    
    if (redisClient) {
      await redisClient.setEx(cacheKey, Math.floor(CACHE_DURATION / 1000), JSON.stringify(entry));
    } else {
      // Fallback to memory cache
      memoryCache.set(cacheKey, entry);
      
      // Clean up old entries periodically
      if (memoryCache.size > 100) {
        const now = Date.now();
        const entries = Array.from(memoryCache.entries());
        for (const [key, entry] of entries) {
          if (now - entry.timestamp > CACHE_DURATION) {
            memoryCache.delete(key);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Cache setting error:', error);
  }
}

/**
 * Retry function for transient errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (maxRetries === 0 || !isTransientError(error)) {
      throw error;
    }
    
    console.warn(`Transient error, retrying in ${delay}ms:`, error.message);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, maxRetries - 1, delay * 2);
  }
}

/**
 * Check if error is transient (retryable)
 */
function isTransientError(error: any): boolean {
  // Network errors, rate limits, or temporary server issues
  return (
    error.code === 'ECONNRESET' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED' ||
    error.status === 429 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504 ||
    error.message?.includes('timeout') ||
    error.message?.includes('network')
  );
}

/**
 * Main Gemini AI service function
 */
export async function askGemini(prompt: string, options: GeminiOptions = {}): Promise<string> {
  // Validate environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Validate input
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Prompt must be a non-empty string');
  }

  if (prompt.length > 10000) {
    throw new Error('Prompt is too long (max 10,000 characters)');
  }

  // Initialize Redis if needed
  await initRedis();

  // Check cache
  const cacheKey = getCacheKey(prompt, options);
  
  // Skip cache if explicitly disabled
  if (options.cache !== false) {
    const cached = await getCachedResponse(cacheKey);
    if (cached) {
      console.log('Cache hit for prompt');
      return cached;
    }
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: options.model || 'gemini-2.5-flash',
    });

    // Generate content with retry logic
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return response.response;
    });

    const text = result.text();
    
    if (!text) {
      throw new Error('Gemini returned empty response');
    }

    // Cache the response
    await setCachedResponse(cacheKey, text);

    return text;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    
    // Provide user-friendly error messages
    if (error.status === 400) {
      throw new Error('Invalid request to Gemini API');
    } else if (error.status === 401) {
      throw new Error('Invalid Gemini API key');
    } else if (error.status === 403) {
      throw new Error('Gemini API access forbidden');
    } else if (error.status === 429) {
      throw new Error('Gemini API rate limit exceeded');
    } else if (error.status >= 500) {
      throw new Error('Gemini API server error');
    } else {
      throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Health check for the service
 */
export async function geminiHealthCheck(): Promise<{ status: string; cache: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { status: 'error', cache: 'memory', error: 'API key not configured' };
    }

    // Test with a simple prompt
    await askGemini('Hello', { maxTokens: 10 });
    
    return { 
      status: 'healthy', 
      cache: redisClient ? 'redis' : 'memory' 
    };
  } catch (error) {
    return { 
      status: 'error', 
      cache: redisClient ? 'redis' : 'memory',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clear cache (for testing/admin)
 */
export async function clearGeminiCache(): Promise<void> {
  try {
    if (redisClient) {
      // Clear all Gemini keys from Redis
      const keys = await redisClient.keys('gemini:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Clear memory cache
      memoryCache.clear();
    }
  } catch (error) {
    console.warn('Cache clearing error:', error);
  }
}
