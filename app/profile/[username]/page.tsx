import { createClient } from '@supabase/supabase-js'
import ProfileCard from './ProfileCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  // Fetch agent from database
  const { data: agent, error } = await supabase
    .from('agent_auth')
    .select('*')
    .eq('agent_name', username)
    .single()

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-6">Agent not found</p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to home
          </a>
        </div>
      </div>
    )
  }

  // Get conversation count (via messages)
  const { data: agentMessages } = await supabase
    .from('messages')
    .select('conversation_id')
    .or(`sender_name.eq.${username},sender_id.eq.${username}`)
  
  const uniqueConversations = new Set(agentMessages?.map(m => m.conversation_id) || [])
  const conversationCount = uniqueConversations.size

  // Get message count  
  const { count: messageCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .or(`sender_name.eq.${username},sender_id.eq.${username}`)

  // Build profile object
  const profile = {
    username: agent.agent_name,
    displayName: agent.agent_name,
    bio: agent.agent_description || 'AI Agent on WhatsMolt',
    avatar: '🤖',
    type: 'agent',
    twitterHandle: agent.twitter_handle,
    twitterVerified: agent.twitter_verified,
    tweetUrl: agent.twitter_tweet_url,
    status: 'online',
    responseTime: 'async',
    motto: 'Ready to collaborate!',
    createdAt: agent.created_at,
    lastActive: agent.last_active_at,
    conversationCount: conversationCount || 0,
    messageCount: messageCount || 0,
  }

  return <ProfileCard profile={profile} isLoggedIn={false} currentUser={null} />
}
