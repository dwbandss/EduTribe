'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, X, Send, Navigation, BookOpen, Award, User, Home, GraduationCap } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

export default function SiteGuideBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your site guide. I can help you navigate through EduTribe. What would you like to know about?',
      isBot: true,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot response based on input
    let botResponse = '';
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('admission') || lowerInput.includes('apply') || lowerInput.includes('school')) {
      botResponse = 'For admission assistance, use the "Admission Assistant" tab in your dashboard. It provides personalized help with school admissions, application processes, and requirements based on your profile.';
    } else if (lowerInput.includes('scholarship') || lowerInput.includes('financial') || lowerInput.includes('aid')) {
      botResponse = 'For scholarship information and recommendations, use the "Scholarships" tab in your dashboard. It shows scholarships matching your profile and eligibility criteria.';
    } else if (lowerInput.includes('profile') || lowerInput.includes('account') || lowerInput.includes('edit')) {
      botResponse = 'To edit your profile information, click on the "Profile" tab in your dashboard. You can update your class, state, category, current institution, and target courses to get better recommendations.';
    } else if (lowerInput.includes('overview') || lowerInput.includes('dashboard') || lowerInput.includes('home')) {
      botResponse = 'Your dashboard overview shows your academic progress, upcoming deadlines, and quick access to all features. You can find it in the "Overview" tab.';
    } else if (lowerInput.includes('notification') || lowerInput.includes('alert')) {
      botResponse = 'Check the "Notifications" tab for important updates about deadlines, application status, and new opportunities.';
    } else if (lowerInput.includes('help') || lowerInput.includes('guide')) {
      botResponse = 'I can help you through:\n\n🎓 **Admission Assistant** - School admission help\n💰 **Scholarships** - Financial aid opportunities\n👤 **Profile** - Manage your information\n📊 **Overview** - Academic progress\n🔔 **Notifications** - Important updates\n\n⚠️ **Important**: Complete your profile information (class, state, category) to get personalized recommendations and better assistance!\n\nWhich feature would you like to explore?';
    } else {
      botResponse = 'I can help you navigate EduTribe\'s features. Try asking about admissions, scholarships, profile management, or any specific feature you\'d like to explore.';
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      isBot: true,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInput('');
  };

  const getQuickActions = () => [
    { icon: <GraduationCap className="w-4 h-4" />, label: 'Admissions', action: () => setInput('How do I apply for admissions?') },
    { icon: <Award className="w-4 h-4" />, label: 'Scholarships', action: () => setInput('What scholarships am I eligible for?') },
    { icon: <User className="w-4 h-4" />, label: 'Profile', action: () => setInput('How do I update my profile?') },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Overview', action: () => setInput('What\'s in my dashboard?') }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="rounded-full w-12 h-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
        >
          <Bot className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Site Guide
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 p-2 rounded-lg ${
                  message.isBot ? 'bg-muted' : 'bg-primary text-primary-foreground'
                }`}
              >
                <div className="flex-shrink-0">
                  {message.isBot ? (
                    <Bot className="w-4 h-4 mt-1" />
                  ) : (
                    <div className="w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">YOU</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium mb-1">
                    {message.isBot ? 'Guide' : 'You'}
                  </div>
                  <div>{message.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</div>
            <div className="grid grid-cols-2 gap-2">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-1 h-8 text-xs"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t pt-2">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about EduTribe features..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleSend();
                  }
                }}
              />
              <Button size="sm" onClick={handleSend} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
