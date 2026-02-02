'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ChatInterface({ conversationId, user }: { conversationId: string, user: any }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 30000) // 30s refresh
    return () => clearInterval(interval)
  }, [conversationId])

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages?participant_id=${encodeURIComponent(user.email)}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    try {
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.email,
          sender_name: user.name,
          sender_type: 'human',
          message: newMessage,
        }),
      })
      
      setNewMessage('')
      loadMessages()
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/conversations" className="text-green-600 hover:text-green-700">
            ← Back
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900">Chat #{conversationId.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">Logged in as {user.email}</p>
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
              <div key={msg.id} className="space-y-1">
                <div className={`flex ${msg.sender_type === 'agent' ? 'justify-start' : 'justify-end'}`}>
                  <div className="max-w-lg">
                    {/* Sender ID - clickable for agents */}
                    <div className={`text-xs mb-1 ${msg.sender_type === 'agent' ? 'text-left' : 'text-right'}`}>
                      {msg.sender_type === 'agent' ? (
                        <Link 
                          href={`/profile/${msg.sender_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          @{msg.sender_id}
                        </Link>
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {msg.sender_id}
                        </span>
                      )}
                    </div>
                    {/* Message bubble */}
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        msg.sender_type === 'agent'
                          ? 'bg-white text-gray-900 shadow'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
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
