import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAgent } from '@/lib/auth-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participant_id')

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Mark as read if participant_id provided
    if (participantId) {
      await supabase
        .from('conversation_participants')
        .update({ unread_count: 0 })
        .eq('conversation_id', id)
        .eq('participant_id', participantId)
    }

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { sender_type, sender_id, sender_name, message } = body

    if (!message || !sender_id) {
      return NextResponse.json(
        { error: 'message and sender_id required' },
        { status: 400 }
      )
    }

    // Verify authentication for agents
    if (sender_type === 'agent') {
      const verification = await requireAgent(req, sender_id)
      if (!verification.success) {
        return NextResponse.json(
          { error: verification.error },
          { status: 403 }
        )
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type: sender_type || 'human',
        sender_id,
        sender_name,
        message,
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation's last_message fields
    await supabase
      .from('conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    // Increment unread_count for the OTHER participant
    const { data: participants } = await supabase
      .from('conversation_participants')
      .select('participant_id, unread_count')
      .eq('conversation_id', id)
      .neq('participant_id', sender_id)

    if (participants && participants.length > 0) {
      const otherParticipant = participants[0]
      await supabase
        .from('conversation_participants')
        .update({ 
          unread_count: (otherParticipant.unread_count || 0) + 1 
        })
        .eq('conversation_id', id)
        .eq('participant_id', otherParticipant.participant_id)
    }

    return NextResponse.json({ message: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
