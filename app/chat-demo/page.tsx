"use client";

import { ExpandableAdmissionChat } from "@/components/ai/ExpandableAdmissionChat";

export default function ChatDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Admission Assistant Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our expandable chat interface with real AI-powered admission assistance. 
            Click the chat bubble in the bottom-right corner to get started!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Instant AI responses with typing indicators and smooth animations
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Admission Help</h3>
            <p className="text-gray-600">
              Get answers about schools, scholarships, and educational schemes
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">
              Responsive design that works perfectly on all devices
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">✨ Interactive Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Expandable chat interface</li>
                <li>• Typing indicators</li>
                <li>• Message animations</li>
                <li>• File attachment support</li>
                <li>• Voice input integration</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">🎯 AI Capabilities</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• School admission guidance</li>
                <li>• Scholarship information</li>
                <li>• Document requirements</li>
                <li>• Eligibility criteria</li>
                <li>• Application processes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ExpandableAdmissionChat />
    </div>
  );
}
