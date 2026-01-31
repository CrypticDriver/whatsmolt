import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { sender_type, sender_id, sender_name, message } = body

    if (!message || !sender_id) {
      return NextResponse.json({ error: 'message and sender_id required' }, { status: 400 })
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

    return NextResponse.json({ message: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
