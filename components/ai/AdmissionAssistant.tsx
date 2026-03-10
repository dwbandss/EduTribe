"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, FileText, ExternalLink, Loader2, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Source {
  id: string;
  type: 'school' | 'scheme';
  title: string;
  state: string;
  category?: string;
  class?: string;
}

interface ChatMessage {
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface AdmissionAssistantProps {
  studentProfile?: {
    class?: string;
    state?: string;
    category?: string;
  };
}

export default function AdmissionAssistant({ studentProfile }: AdmissionAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    setError('');

    setTimeout(() => setIsTyping(false), 1500);

    try {
      const response = await fetch('/api/ai/admission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          studentProfile
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          type: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(data.message || 'Failed to get response');
      }
    } catch (err) {
      setError('Failed to connect to admission assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const getSourceIcon = (type: string) => {
    return type === 'school' ? '🏫' : '📋';
  };

  const getSourceTypeColor = (type: string) => {
    return type === 'school' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <ArrowRight className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-left">
              <CardTitle className="text-2xl font-bold">Admission Assistant</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online • AI Powered</span>
              </div>
            </div>
          </div>
          <CardDescription className="text-base">
            I'm your AI assistant for school admissions, scholarships, and educational schemes. 
            Ask me anything about eligibility, required documents, or application processes!
          </CardDescription>
          {studentProfile && (
            <div className="flex justify-center space-x-2 mt-3">
              {studentProfile.class && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-secondary text-secondary-foreground border-transparent">
                  Class {studentProfile.class}
                </span>
              )}
              {studentProfile.state && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-secondary text-secondary-foreground border-transparent">
                  {studentProfile.state}
                </span>
              )}
              {studentProfile.category && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-secondary text-secondary-foreground border-transparent">
                  {studentProfile.category}
                </span>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="bg-muted/30 rounded-lg border p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-9 h-9 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Hello! I'm here to help</h3>
            <p className="text-muted-foreground mb-4">
              I can assist you with admission queries, scholarship information, and educational schemes.
            </p>
            <div className="bg-background rounded-lg p-3 text-left max-w-md mx-auto">
              <div className="text-sm font-medium mb-2">Try asking:</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• "What documents are required for EMRS admission in Odisha?"</div>
                <div>• "How to apply for ST scholarship?"</div>
                <div>• "What are the eligibility criteria for Navodaya schools?"</div>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg rounded-2xl p-4 ${message.type === 'user' ? 'bg-primary text-primary-foreground ml-8' : 'bg-background border mr-8'}`}>
              <div className="flex items-start space-x-3">
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Sources ({message.sources.length})</span>
                      </div>
                      <div className="space-y-2">
                        {message.sources.map((source, sourceIndex) => (
                          <div key={sourceIndex} className="bg-muted/50 rounded-lg p-3 border">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-base">{getSourceIcon(source.type)}</span>
                                  <h4 className="font-medium text-sm">{source.title}</h4>
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getSourceTypeColor(source.type)}`}>
                                    {source.type}
                                  </span>
                                  {source.state && (
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-border bg-background text-foreground">
                                      {source.state}
                                    </span>
                                  )}
                                  {source.category && (
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-border bg-background text-foreground">
                                      {source.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="ml-2 h-8 w-8 p-0">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg rounded-2xl p-4 bg-background border mr-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading && !isTyping && (
          <div className="flex justify-start mb-4">
            <div className="max-w-lg rounded-2xl p-4 bg-background border mr-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <span className="text-sm text-muted-foreground">Processing your query...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mb-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about admission requirements, documents, schemes..."
                  disabled={isLoading}
                  className="pr-12 text-base"
                />
                {input && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 px-6">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>Limited to 10 queries per hour for fair usage</div>
              <div>Be specific for better results</div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
