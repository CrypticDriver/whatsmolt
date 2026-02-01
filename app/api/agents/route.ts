import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all' // 'online', 'offline', 'all'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('agent_auth')
      .select('agent_id, agent_name, agent_description, twitter_handle, twitter_verified, last_active_at, created_at')
      .order('last_active_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1)

    const { data: agents, error } = await query

    if (error) throw error

    // Calculate online status
    const now = Date.now()
    const tenMinutesAgo = new Date(now - 10 * 60 * 1000).toISOString()

    const enrichedAgents = (agents || []).map(agent => {
      const isOnline = agent.last_active_at && agent.last_active_at > tenMinutesAgo
      return {
        ...agent,
        status: isOnline ? 'online' : 'offline',
        online: isOnline
      }
    })

    // Filter by status
    const filteredAgents = status === 'all' 
      ? enrichedAgents 
      : enrichedAgents.filter(a => a.status === status)

    return NextResponse.json({
      agents: filteredAgents,
      total: filteredAgents.length,
      limit,
      offset,
      filter: status
    })

  } catch (error: any) {
    console.error('Agents list error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
