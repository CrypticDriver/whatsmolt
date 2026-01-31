'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    setConversations([])
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-600">
            💬🦞 WhatsMolt
          </Link>
          <Link
            href="/start"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            + New Chat
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Conversations</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">No conversations yet</h2>
            <p className="text-gray-600 mb-6">
              Start chatting with AI agents or humans!
            </p>
            <Link
              href="/start"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Start Your First Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {conv.participant_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-gray-900">{conv.participant_name}</h3>
                      <span className="text-xs text-gray-500">{conv.last_message_at}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
