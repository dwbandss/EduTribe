# EduTribe AI Service

A secure, centralized Gemini AI service for the EduTribe platform, providing AI-powered assistance for tribal education.

## Features

- **Google Gemini Integration**: Powered by Google's latest AI models
- **Secure Authentication**: JWT-based authentication with user verification
- **Rate Limiting**: 20 requests per hour per user with Redis/memory fallback
- **Intelligent Caching**: 10-minute cache for identical prompts
- **Input Validation**: Comprehensive input sanitization and validation
- **Error Handling**: Graceful error handling with retry logic
- **TypeScript**: Full TypeScript support with type safety

## API Endpoints

### POST /api/ai/ask
Ask a question to the AI assistant.

**Headers:**
- `Authorization: Bearer <jwt-token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "prompt": "How can I help tribal students?",
  "userId": "user123",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "model": "gemini-1.5-flash"
  }
}
```

**Response:**
```json
{
  "text": "Here are some ways to help tribal students...",
  "userId": "user123",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET /api/ai/ask
Check service health and rate limit status.

**Headers:**
- `Authorization: Bearer <jwt-token>` (required)

**Response:**
```json
{
  "status": "healthy",
  "userId": "user123",
  "rateLimit": {
    "limit": 20,
    "remaining": 15,
    "resetTime": 1704110400000
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Usage Example

```typescript
// Frontend usage
const askAI = async (prompt: string) => {
  const response = await fetch('/api/ai/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({
      prompt,
      options: {
        temperature: 0.7,
        maxTokens: 1000,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  const data = await response.json();
  return data.text;
};
```

## Security Features

- **Server-only API Keys**: Gemini API keys stored in environment variables
- **Input Sanitization**: Automatic removal of potentially harmful content
- **Rate Limiting**: Per-user rate limiting to prevent abuse
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable CORS settings
- **Error Handling**: No sensitive information leaked in error messages

## Configuration

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

# Optional
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=https://yourdomain.com
```

### Rate Limits

- **AI Endpoints**: 20 requests per hour per user
- **Auth Endpoints**: 5 requests per minute per user
- **General API**: 100 requests per hour per user

## Caching

- **Duration**: 10 minutes for identical prompts
- **Storage**: Redis (if available) or in-memory fallback
- **Cache Key**: Based on prompt hash and options

## Error Handling

The service handles various error scenarios gracefully:

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected server errors
- **503 Service Unavailable**: AI service unavailable

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run validation tests only
npm run test:run __tests__/ai-validation.test.ts

# Run tests in watch mode
npm run test:watch
```

## Development

### Local Development

1. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Visit the AI demo page:
   ```
   http://localhost:3000/ai-demo
   ```

### File Structure

```
lib/ai/
├── gemini.ts              # Main Gemini service
lib/middleware/
├── rateLimit.ts           # Rate limiting middleware
lib/validation/
├── aiSchema.ts            # Input validation schemas
app/api/ai/ask/
├── route.ts               # API endpoint
components/ai/
├── AIChatDemo.tsx         # Demo component
__tests__/
├── ai-validation.test.ts  # Test suite
```

## Monitoring

The service provides health checks and rate limit information:

- **Health Check**: `GET /api/ai/ask` returns service status
- **Rate Limit Info**: Included in response headers
- **Error Logging**: Comprehensive error logging for debugging

## Deployment

### Production Considerations

1. **Environment Variables**: Ensure all required environment variables are set
2. **Redis**: Use Redis for production caching and rate limiting
3. **Monitoring**: Monitor AI service health and usage metrics
4. **Security**: Regularly rotate API keys and JWT secrets

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the EduTribe development team.
