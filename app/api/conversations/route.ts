import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participant_id')
    
    if (!participantId) {
      return NextResponse.json({ error: 'participant_id required' }, { status: 400 })
    }

    // Get conversations for this participant
    const { data: participants, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, unread_count, participant_id')
      .eq('participant_id', participantId)

    if (partError) throw partError

    const conversationIds = participants?.map(p => p.conversation_id) || []

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // Get conversation details
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convError) throw convError

    // Enrich with participant info and unread count
    const enriched = await Promise.all(
      (conversations || []).map(async (conv) => {
        // Get other participant
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conv.id)
          .neq('participant_id', participantId)
          .single()

        const myData = participants?.find(p => p.conversation_id === conv.id)

        return {
          ...conv,
          participant_name: otherParticipant?.participant_name || 'Unknown',
          participant_id: otherParticipant?.participant_id,
          unread_count: myData?.unread_count || 0,
        }
      })
    )

    return NextResponse.json({ conversations: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { participant1_id, participant1_name, participant1_type, participant2_id, participant2_name, participant2_type } = body

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single()

    if (convError) throw convError

    // Add participants
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        {
          conversation_id: conversation.id,
          participant_type: participant1_type || 'human',
          participant_id: participant1_id,
          participant_name: participant1_name,
        },
        {
          conversation_id: conversation.id,
          participant_type: participant2_type || 'agent',
          participant_id: participant2_id,
          participant_name: participant2_name,
        },
      ])

    if (partError) throw partError

    return NextResponse.json({ conversation })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
