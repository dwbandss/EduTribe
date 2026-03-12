'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, ExternalLink, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  question: string;
  answer: string;
  sources: Array<{
    id: string;
    type: 'school' | 'scheme';
    title: string;
  }>;
  timestamp: string;
}

interface AdmissionAssistantProps {
  studentProfile: {
    class: string;
    state: string;
    category?: string;
  };
}

export default function AdmissionAssistant({ studentProfile }: AdmissionAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askQuestion = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/admission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          studentProfile
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessage: Message = {
          id: Date.now().toString(),
          question: input,
          answer: data.data.answer,
          sources: data.data.sources,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
      } else {
        console.error('Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Admission Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[500px] overflow-y-auto p-4 space-y-4">
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 p-3 bg-muted rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <div>
                    <p className="font-medium text-sm text-primary mb-1">Q: {message.question}</p>
                    <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
                      {message.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sources */}
          {messages.length > 0 && messages[messages.length - 1].sources && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-sm mb-2">Sources:</h4>
              <div className="space-y-2">
                {messages[messages.length - 1].sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-background border rounded-lg">
                    <Badge variant={source.type === 'school' ? 'default' : 'secondary'}>
                      {source.type}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{source.title}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(source.type === 'school' ? '/school-finder' : '#', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {source.type === 'school' ? 'View School' : 'Open Link'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about admissions, schemes, or schools..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    askQuestion();
                  }
                }}
              />
              <Button 
                onClick={askQuestion} 
                disabled={isLoading || !input.trim()}
                className="px-4 py-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
