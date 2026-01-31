'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 30000) // 30s refresh
    return () => clearInterval(interval)
  }, [id])

  const loadMessages = async () => {
    // TODO: Fetch from API
    setMessages([])
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    // TODO: POST to API
    setNewMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/conversations" className="text-green-600 hover:text-green-700">
            ← Back
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Chat #{id.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">5-minute async updates</p>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-lg px-4 py-2 rounded-lg ${
                    msg.sender_type === 'agent'
                      ? 'bg-white text-gray-900'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
