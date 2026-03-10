"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface AIResponse {
  text: string;
  userId?: string;
  timestamp?: string;
  error?: string;
}

export function AIChatDemo() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      // In a real app, you'd get the JWT from your auth context
      const mockJWT = 'Bearer mock.jwt.token'; // Replace with actual JWT
      
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': mockJWT,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const mockJWT = 'Bearer mock.jwt.token';
      
      const res = await fetch('/api/ai/ask', {
        method: 'GET',
        headers: {
          'Authorization': mockJWT,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({
          text: `Service Status: ${data.status}\nRate Limit: ${data.rateLimit?.remaining}/${data.rateLimit?.limit} requests remaining`,
          userId: data.userId,
          timestamp: data.timestamp,
        });
      } else {
        setError(data.error || 'Health check failed');
      }
    } catch (err) {
      setError('Failed to check service health');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            EduTribe AI Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about tribal education, get help with lesson plans, or explore educational resources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Ask me anything about tribal education..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading || !prompt.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={handleHealthCheck}
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Health
              </Button>
            </div>
          </form>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {response && !error && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-green-800 font-medium">AI Response</p>
                    {response.timestamp && (
                      <p className="text-green-600 text-xs">
                        {new Date(response.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="text-green-700 whitespace-pre-wrap">
                    {response.text}
                  </div>
                  {response.userId && (
                    <p className="text-green-600 text-xs">
                      User ID: {response.userId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Example Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "How can I create engaging lesson plans for tribal students?",
              "What are effective teaching strategies for rural classrooms?",
              "How can NGOs partner with tribal schools effectively?",
              "What resources are available for tribal education?",
              "How to organize volunteer programs for tribal communities?",
            ].map((examplePrompt) => (
              <Button
                key={examplePrompt}
                variant="ghost"
                size="sm"
                onClick={() => setPrompt(examplePrompt)}
                disabled={isLoading}
                className="h-auto p-2 text-left justify-start"
              >
                {examplePrompt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• 20 requests per hour per user</p>
            <p>• Rate limit info included in response headers</p>
            <p>• Cached responses don't count toward limits</p>
            <p>• 10-minute cache duration for identical prompts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
