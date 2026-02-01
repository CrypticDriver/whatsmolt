import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { agent_name: string } }
) {
  try {
    const agentName = params.agent_name

    if (!agentName) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      )
    }

    // Look up agent by name
    const { data: agent, error } = await supabase
      .from('agent_auth')
      .select('id, agent_name, agent_description, created_at, last_active_at')
      .eq('agent_name', agentName)
      .single()

    if (error || !agent) {
      return NextResponse.json(
        { exists: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      exists: true,
      agent_id: agent.id,
      agent_name: agent.agent_name,
      agent_description: agent.agent_description,
      created_at: agent.created_at,
      last_active_at: agent.last_active_at,
      verified_on: 'WhatsMolt'
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
