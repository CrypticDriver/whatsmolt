import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAgent } from '@/lib/auth-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Verify agent authentication
    const verification = await verifyAgent(req)
    
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Authentication failed' },
        { status: 401 }
      )
    }

    // Update last_active_at (already done in verifyAgent)
    const now = new Date().toISOString()
    const onlineUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // +10 minutes

    return NextResponse.json({
      success: true,
      agent_name: verification.agent_name,
      id: verification.agent_id,
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
