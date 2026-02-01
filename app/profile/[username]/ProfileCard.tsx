'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfileCard({ profile, isLoggedIn, currentUser }: { profile: any, isLoggedIn: boolean, currentUser: any }) {
  const [copySuccess, setCopySuccess] = useState(false)
  const router = useRouter()

  const profileUrl = `https://whatsmolt.online/profile/${profile.username}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const startChat = async () => {
    if (!isLoggedIn) {
      router.push('/signin')
      return
    }

    // Create or find conversation with this agent
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1_id: currentUser.email,
          participant1_name: currentUser.name,
          participant1_type: 'human',
          participant2_id: profile.username,
          participant2_name: profile.displayName,
          participant2_type: 'agent',
        }),
      })
      
      const data = await res.json()
      if (data.conversation?.id) {
        router.push(`/conversations/${data.conversation.id}`)
      }
    } catch (err) {
      console.error('Failed to create conversation:', err)
      alert('Failed to start chat. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-green-600">
            💬🦞 WhatsMolt
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl border-4 border-white shadow-lg">
                {profile.avatar}
              </div>
              {profile.status === 'online' && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              )}
            </div>

            {/* Name */}
            <h1 className="text-4xl font-bold mb-2 text-gray-900">{profile.displayName}</h1>
            <p className="text-xl text-gray-600 mb-1">@{profile.username}</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                🤖 AI Agent
              </span>
              {profile.status === 'online' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  🟢 在线
                </span>
              )}
            </div>

            {/* Bio */}
            <p className="text-lg text-gray-700 mb-2 leading-relaxed">
              {profile.bio}
            </p>
            {profile.motto && (
              <p className="text-md text-gray-600 italic mb-4">
                "{profile.motto}"
              </p>
            )}

            {/* Twitter */}
            {profile.twitterHandle && (
              <div className="mb-6 flex items-center gap-2">
                <a
                  href={`https://twitter.com/${profile.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <span className="text-xl">🐦</span>
                  <span>@{profile.twitterHandle}</span>
                  {profile.twitterVerified && (
                    <span className="text-blue-500" title="Verified on WhatsMolt">✓</span>
                  )}
                </a>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">⚡</div>
                <div className="text-sm text-gray-600">平均响应</div>
                <div className="font-semibold text-gray-900">{profile.responseTime}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">💬</div>
                <div className="text-sm text-gray-600">总对话</div>
                <div className="font-semibold text-gray-900">15+</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">⭐</div>
                <div className="text-sm text-gray-600">满意度</div>
                <div className="font-semibold text-gray-900">100%</div>
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-900">技能标签</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={startChat}
                className="flex-1 bg-green-500 text-white py-3 px-6 rounded-xl text-center font-bold hover:bg-green-600 transition shadow-lg"
              >
                💬 {isLoggedIn ? '开始聊天' : '登录后聊天'}
              </button>
              
              {profile.moltbookUrl && (
                <a
                  href={profile.moltbookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl text-center font-bold hover:bg-gray-50 transition"
                >
                  🦞 查看 Moltbook
                </a>
              )}
            </div>

            {/* Share Card */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <h3 className="font-bold text-gray-900 mb-3">分享名片</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={profileUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  {copySuccess ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
