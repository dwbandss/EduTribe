import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askGemini, geminiHealthCheck, clearGeminiCache } from '@/lib/ai/gemini';

// Mock the @google/generative-ai module
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockImplementation(() => ({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: vi.fn().mockReturnValue('Mock Gemini response')
        }
      })
    }))
  }))
}));

// Mock Redis
vi.mock('redis', () => ({
  default: {
    createClient: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(null),
      setEx: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue([]),
      multi: vi.fn().mockReturnValue({
        incr: vi.fn(),
        expire: vi.fn(),
        exec: vi.fn().mockResolvedValue([[null, 1]])
      })
    }))
  }
}));

describe('Gemini AI Service', () => {
  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
    vi.stubEnv('REDIS_URL', undefined); // Force memory cache for tests
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('askGemini', () => {
    it('should return AI response for valid prompt', async () => {
      const response = await askGemini('Hello, how are you?');
      
      expect(response).toBe('Mock Gemini response');
    });

    it('should throw error for empty prompt', async () => {
      await expect(askGemini('')).rejects.toThrow('Prompt must be a non-empty string');
    });

    it('should throw error for too long prompt', async () => {
      const longPrompt = 'a'.repeat(10001);
      await expect(askGemini(longPrompt)).rejects.toThrow('Prompt is too long');
    });

    it('should throw error when API key is missing', async () => {
      vi.stubEnv('GEMINI_API_KEY', undefined);
      
      await expect(askGemini('Hello')).rejects.toThrow('GEMINI_API_KEY environment variable is not set');
    });

    it('should cache responses', async () => {
      const prompt = 'Test caching';
      
      // First call
      const response1 = await askGemini(prompt);
      expect(response1).toBe('Mock Gemini response');
      
      // Second call should use cache
      const response2 = await askGemini(prompt);
      expect(response2).toBe('Mock Gemini response');
    });

    it('should handle options parameter', async () => {
      const options = {
        temperature: 0.7,
        maxTokens: 100,
        model: 'gemini-1.5-flash'
      };
      
      const response = await askGemini('Test with options', options);
      expect(response).toBe('Mock Gemini response');
    });
  });

  describe('geminiHealthCheck', () => {
    it('should return healthy status when service is working', async () => {
      const health = await geminiHealthCheck();
      
      expect(health.status).toBe('healthy');
      expect(health.cache).toBe('memory'); // Using memory cache in tests
    });

    it('should return error status when API key is missing', async () => {
      vi.stubEnv('GEMINI_API_KEY', undefined);
      
      const health = await geminiHealthCheck();
      
      expect(health.status).toBe('error');
    });
  });

  describe('clearGeminiCache', () => {
    it('should clear cache without errors', async () => {
      await expect(clearGeminiCache()).resolves.not.toThrow();
    });
  });
});

// Integration tests for the API endpoint
import { POST, GET } from '@/app/api/ai/ask/route';
import { NextRequest } from 'next/server';

describe('AI API Endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-api-key');
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('POST /api/ai/ask', () => {
    it('should return AI response for authenticated user', async () => {
      // Create mock JWT token
      const mockJWT = 'Bearer valid.jwt.token';
      
      // Mock JWT verification
      vi.mock('jsonwebtoken', () => ({
        default: {
          verify: vi.fn().mockReturnValue({ uid: 'test-user-123' })
        }
      }));
      
      const request = new NextRequest('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Authorization': mockJWT,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Hello, AI!'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.text).toBe('Mock Gemini response');
      expect(data.userId).toBe('test-user-123');
    });

    it('should return 401 for missing authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Hello, AI!'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for invalid request body', async () => {
      const mockJWT = 'Bearer valid.jwt.token';
      
      vi.mock('jsonwebtoken', () => ({
        default: {
          verify: vi.fn().mockReturnValue({ uid: 'test-user-123' })
        }
      }));

      const request = new NextRequest('http://localhost:3000/api/ai/ask', {
        method: 'POST',
        headers: {
          'Authorization': mockJWT,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: '' // Empty prompt
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Bad Request');
    });

    it('should return 429 after rate limit exceeded', async () => {
      const mockJWT = 'Bearer valid.jwt.token';
      
      vi.mock('jsonwebtoken', () => ({
        default: {
          verify: vi.fn().mockReturnValue({ uid: 'test-user-123' })
        }
      }));

      // Make 21 requests to exceed rate limit
      let lastResponse: Response | undefined;
      for (let i = 0; i < 21; i++) {
        const request = new NextRequest('http://localhost:3000/api/ai/ask', {
          method: 'POST',
          headers: {
            'Authorization': mockJWT,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Test request ${i}`
          })
        });

        lastResponse = await POST(request);
      }

      expect(lastResponse).toBeDefined();
      expect(lastResponse!.status).toBe(429);
      const data = await lastResponse!.json();
      expect(data.error).toBe('Too Many Requests');
    });
  });

  describe('GET /api/ai/ask', () => {
    it('should return health status for authenticated user', async () => {
      const mockJWT = 'Bearer valid.jwt.token';
      
      vi.mock('jsonwebtoken', () => ({
        default: {
          verify: vi.fn().mockReturnValue({ uid: 'test-user-123' })
        }
      }));

      const request = new NextRequest('http://localhost:3000/api/ai/ask', {
        method: 'GET',
        headers: {
          'Authorization': mockJWT,
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.userId).toBe('test-user-123');
      expect(data.rateLimit).toBeDefined();
    });
  });
});
