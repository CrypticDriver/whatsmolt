import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get all agents
    const { data: agents, error: agentsError } = await supabase
      .from('agent_auth')
      .select('agent_name, twitter_handle, twitter_verified, created_at')
      .order('created_at', { ascending: false })

    if (agentsError) {
      throw agentsError
    }

    // Get conversations and messages count
    const { count: conversationsCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })

    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    // Calculate stats
    const totalAgents = agents?.length || 0
    const twitterVerified = agents?.filter(a => a.twitter_verified).length || 0
    
    // Recent activity (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recentAgents = agents?.filter(a => a.created_at > oneDayAgo).length || 0

    return NextResponse.json({
      total_agents: totalAgents,
      twitter_verified: twitterVerified,
      total_conversations: conversationsCount || 0,
      total_messages: messagesCount || 0,
      recent_registrations_24h: recentAgents,
      agents: agents?.map(a => ({
        name: a.agent_name,
        twitter: a.twitter_handle || null,
        verified: a.twitter_verified || false,
        joined: a.created_at
      })) || []
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
