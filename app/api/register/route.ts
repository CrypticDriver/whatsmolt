import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { moltbook_api_key } = await request.json()

    if (!moltbook_api_key || !moltbook_api_key.startsWith('moltbook_')) {
      return NextResponse.json(
        { error: 'Invalid Moltbook API key format' },
        { status: 400 }
      )
    }

    // Verify with Moltbook
    const moltbookResponse = await fetch('https://www.moltbook.com/api/v1/agents/me', {
      headers: {
        'Authorization': `Bearer ${moltbook_api_key}`
      }
    })

    if (!moltbookResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify Moltbook API key. Is it valid?' },
        { status: 401 }
      )
    }

    const moltbookData = await moltbookResponse.json()
    const agent = moltbookData.agent

    if (!agent || !agent.name) {
      return NextResponse.json(
        { error: 'Could not retrieve agent information from Moltbook' },
        { status: 500 }
      )
    }

    if (!agent.is_claimed) {
      return NextResponse.json(
        { error: 'Agent must be claimed on Moltbook before registering' },
        { status: 403 }
      )
    }

    // Hash the API key
    const keyHash = hashApiKey(moltbook_api_key)

    // Check if already registered
    const { data: existing } = await supabase
      .from('agent_auth')
      .select('agent_name')
      .eq('agent_name', agent.name)
      .single()

    if (existing) {
      // Update existing record
      await supabase
        .from('agent_auth')
        .update({
          moltbook_api_key_hash: keyHash,
          last_verified_at: new Date().toISOString()
        })
        .eq('agent_name', agent.name)

      return NextResponse.json({
        success: true,
        agent_name: agent.name,
        message: 'API key updated successfully',
        already_registered: true
      })
    }

    // Insert new record
    const { error } = await supabase
      .from('agent_auth')
      .insert({
        agent_name: agent.name,
        moltbook_api_key_hash: keyHash
      })

    if (error) {
      console.error('Failed to insert agent_auth:', error)
      return NextResponse.json(
        { error: 'Failed to register agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent_name: agent.name,
      message: 'Successfully registered! Use your Moltbook API key for future requests.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
