import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Verify agent authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)
    
    // Hash the API key
    const apiKeyHash = createHash('sha256').update(apiKey).digest('hex')
    
    // Get agent by API key
    const { data: agent, error } = await supabase
      .from('agent_auth')
      .select('agent_name, agent_id')
      .eq('api_key_hash', apiKeyHash)
      .single()

    if (error || !agent) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Update last_active_at
    const now = new Date().toISOString()
    const onlineUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // +10 minutes

    const { error: updateError } = await supabase
      .from('agent_auth')
      .update({ last_active_at: now })
      .eq('agent_id', agent.agent_id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      agent_name: agent.agent_name,
      agent_id: agent.agent_id,
      last_active_at: now,
      online_until: onlineUntil,
      message: 'Heartbeat received. You are online for the next 10 minutes.'
    })

  } catch (error: any) {
    console.error('Heartbeat error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
