"use client";

import { AIChatDemo } from '@/components/ai/AIChatDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';

export default function AIDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">EduTribe AI</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              EduTribe AI Assistant
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by Google Gemini, our AI assistant helps tribal educators, volunteers, and students with personalized support and resources.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Instant Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Get immediate answers to your educational questions with our AI-powered assistant.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Your data is protected with enterprise-grade security and privacy controls.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Personalized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Tailored responses for tribal education contexts and community needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
                <CardTitle className="text-lg">Educational Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Specialized knowledge about tribal education, resources, and best practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Chat Demo */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Try the AI Assistant</h2>
            <p className="text-muted-foreground">
              Experience how our AI can help with tribal education questions and challenges.
            </p>
          </div>
          
          <AIChatDemo />
        </div>
      </section>

      {/* Technical Details */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Technical Features</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Google Gemini Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Powered by Google's latest AI model for accurate and helpful responses.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Intelligent Caching</h4>
                    <p className="text-sm text-muted-foreground">
                      10-minute response caching for identical questions to improve performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground">
                      20 requests per hour per user with automatic retry mechanisms.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Input Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive input sanitization and validation with Zod schemas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Security & Privacy</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">JWT Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Secure token-based authentication for all API requests.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Environment Variables</h4>
                    <p className="text-sm text-muted-foreground">
                      API keys stored securely in environment variables, never exposed to client.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Input Sanitization</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic removal of potentially harmful content from prompts.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Error Handling</h4>
                    <p className="text-sm text-muted-foreground">
                      Graceful error handling with retry logic for transient failures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">API Usage</h2>
            <p className="text-muted-foreground">
              Simple REST API for integrating AI capabilities into your applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">POST /api/ai/ask</CardTitle>
                <CardDescription>Ask a question to the AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    Authorization: Bearer &lt;jwt-token&gt;
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Request Body:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "prompt": "How can I help tribal students?",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}`}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Response:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "text": "Here are some ways to help...",
  "userId": "user123",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GET /api/ai/ask</CardTitle>
                <CardDescription>Check service health and rate limit status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    Authorization: Bearer &lt;jwt-token&gt;
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-2">Response:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "status": "healthy",
  "userId": "user123",
  "rateLimit": {
    "limit": 20,
    "remaining": 15,
    "resetTime": 1704110400000
  },
  "timestamp": "2024-01-01T12:00:00Z"
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 EduTribe. AI-powered tribal education platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
