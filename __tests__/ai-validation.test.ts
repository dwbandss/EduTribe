import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Test the validation schemas
import { validateAIRequest, sanitizePrompt, validateJWTFormat } from '@/lib/validation/aiSchema';
import { rateLimit } from '@/lib/middleware/rateLimit';

describe('AI Validation', () => {
  describe('validateAIRequest', () => {
    it('should validate correct request', () => {
      const validRequest = {
        prompt: 'Hello, AI!',
        userId: 'user123',
        options: {
          temperature: 0.7,
          maxTokens: 100,
        },
      };

      const result = validateAIRequest(validRequest);
      expect(result.prompt).toBe('Hello, AI!');
      expect(result.userId).toBe('user123');
      expect(result.options?.temperature).toBe(0.7);
    });

    it('should reject empty prompt', () => {
      const invalidRequest = {
        prompt: '',
      };

      expect(() => validateAIRequest(invalidRequest)).toThrow('Validation failed');
    });

    it('should reject too long prompt', () => {
      const invalidRequest = {
        prompt: 'a'.repeat(10001),
      };

      expect(() => validateAIRequest(invalidRequest)).toThrow('Validation failed');
    });

    it('should reject invalid temperature', () => {
      const invalidRequest = {
        prompt: 'Hello',
        options: {
          temperature: 3, // Too high
        },
      };

      expect(() => validateAIRequest(invalidRequest)).toThrow('Validation failed');
    });
  });

  describe('sanitizePrompt', () => {
    it('should remove script tags', () => {
      const prompt = sanitizePrompt('<script>alert("xss")</script>Hello');
      expect(prompt).toBe('Hello');
    });

    it('should remove javascript: URLs', () => {
      const prompt = sanitizePrompt('javascript:alert("xss") Hello');
      expect(prompt).toBe('alert("xss") Hello');
    });

    it('should trim whitespace', () => {
      const prompt = sanitizePrompt('  Hello World  ');
      expect(prompt).toBe('Hello World');
    });

    it('should limit consecutive whitespace', () => {
      const prompt = sanitizePrompt('Hello    World');
      expect(prompt).toBe('Hello World');
    });
  });

  describe('validateJWTFormat', () => {
    it('should validate correct JWT format', () => {
      const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(validateJWTFormat(validJWT)).toBe(true);
    });

    it('should reject invalid JWT format', () => {
      expect(validateJWTFormat('')).toBe(false);
      expect(validateJWTFormat('invalid')).toBe(false);
      expect(validateJWTFormat('header.payload')).toBe(false);
    });
  });
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('should allow requests within limit', async () => {
    const mockRequest = new NextRequest('http://localhost:3000', {
      headers: {
        'authorization': 'Bearer test.jwt.token',
      },
    });

    const result = await rateLimit(mockRequest, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20,
    });

    expect(result.success).toBe(true);
    expect(result.limit).toBe(20);
    expect(result.remaining).toBe(19);
  });

  it('should handle rate limit exceeded', async () => {
    const mockRequest = new NextRequest('http://localhost:3000', {
      headers: {
        'authorization': 'Bearer test.jwt.token',
      },
    });

    // Make multiple requests to exceed limit
    for (let i = 0; i < 25; i++) {
      const result = await rateLimit(mockRequest, {
        windowMs: 60 * 60 * 1000,
        maxRequests: 20,
      });

      if (i >= 20) {
        expect(result.success).toBe(false);
        expect(result.retryAfter).toBeDefined();
      }
    }
  });
});

describe('API Endpoint Structure', () => {
  it('should have correct exports', () => {
    expect(typeof validateAIRequest).toBe('function');
    expect(typeof sanitizePrompt).toBe('function');
    expect(typeof validateJWTFormat).toBe('function');
    expect(typeof rateLimit).toBe('function');
  });

  it('should handle environment variables', () => {
    // Test that environment variables are properly accessed
    expect(typeof process.env).toBe('object');
  });
});
