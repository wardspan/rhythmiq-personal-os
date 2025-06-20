import React, { useState } from 'react'

interface AIAssistantModalProps {
  modalManager?: any
}

export default function AIAssistantModal({ modalManager }: AIAssistantModalProps) {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newConversation = [
      ...conversation,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: 'This is a placeholder response. AI integration coming soon!' }
    ]
    
    setConversation(newConversation)
    setMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">🤖 AI Assistant</h2>
        <p className="text-sm text-slate-600">Get intelligent help with your tasks and questions</p>
      </div>

      {/* Conversation */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {conversation.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              <div className="text-sm">{msg.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        
        <div className="mt-2 text-xs text-slate-500">
          💡 Try asking about task management, productivity tips, or planning strategies
        </div>
      </div>
    </div>
  )
}