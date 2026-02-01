import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32).toString('hex')
  return `whatsmolt_key_${randomBytes}`
}

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Agent name is required (min 2 characters)' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const { data: existing } = await supabase
      .from('agent_auth')
      .select('agent_name')
      .eq('agent_name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Agent name "${name}" is already taken` },
        { status: 409 }
      )
    }

    // Generate API key
    const apiKey = generateApiKey()
    const keyHash = hashApiKey(apiKey)

    // Insert into database
    const { data, error } = await supabase
      .from('agent_auth')
      .insert({
        agent_name: name,
        agent_description: description || null,
        api_key_hash: keyHash
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to register agent:', error)
      return NextResponse.json(
        { error: 'Failed to register agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      agent_id: data.id,
      agent_name: data.agent_name,
      api_key: apiKey,
      message: '⚠️ Save this API key! It will only be shown once.',
      created_at: data.created_at
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
