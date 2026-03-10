import { z } from 'zod';

/**
 * Schema for AI request validation
 */
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, 'Prompt cannot be empty')
    .max(10000, 'Prompt is too long (max 10,000 characters)')
    .trim(),
  userId: z
    .string()
    .optional()
    .transform(val => val?.trim() || undefined),
  options: z
    .object({
      temperature: z
        .number()
        .min(0, 'Temperature must be at least 0')
        .max(2, 'Temperature must be at most 2')
        .optional(),
      maxTokens: z
        .number()
        .min(1, 'Max tokens must be at least 1')
        .max(8192, 'Max tokens must be at most 8192')
        .optional(),
      model: z
        .string()
        .min(1, 'Model name cannot be empty')
        .max(100, 'Model name is too long')
        .optional(),
    })
    .optional(),
});

/**
 * Schema for AI response
 */
export const aiResponseSchema = z.object({
  text: z.string().min(1, 'Response text cannot be empty'),
  cached: z.boolean().optional(),
  model: z.string().optional(),
  usage: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalTokens: z.number().optional(),
    })
    .optional(),
});

/**
 * Schema for error responses
 */
export const errorResponseSchema = z.object({
  error: z.string().min(1, 'Error message cannot be empty'),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.any().optional(),
});

/**
 * Schema for rate limit info
 */
export const rateLimitSchema = z.object({
  limit: z.number().min(0),
  remaining: z.number().min(0),
  resetTime: z.number().min(0),
  retryAfter: z.number().min(0).optional(),
});

/**
 * Input sanitization functions
 */
export const sanitizePrompt = (prompt: string): string => {
  return prompt
    .trim()
    // Remove potentially harmful content patterns
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Limit consecutive whitespace
    .replace(/\s+/g, ' ')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

/**
 * Validate and transform AI request
 */
export const validateAIRequest = (data: unknown) => {
  const result = aiRequestSchema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.issues.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
    
    throw new Error(`Validation failed: ${errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`);
  }
  
  // Sanitize the prompt
  const sanitized = {
    ...result.data,
    prompt: sanitizePrompt(result.data.prompt),
  };
  
  return sanitized;
};

/**
 * Validate JWT token format (basic validation)
 */
export const validateJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  try {
    // Check if base64 parts are valid
    atob(parts[0]);
    atob(parts[1]);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract user ID from JWT token
 */
export const extractUserIdFromJWT = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.uid || payload.sub || payload.userId || null;
  } catch {
    return null;
  }
};

/**
 * Type definitions
 */
export type AIRequest = z.infer<typeof aiRequestSchema>;
export type AIResponse = z.infer<typeof aiResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type RateLimitInfo = z.infer<typeof rateLimitSchema>;
