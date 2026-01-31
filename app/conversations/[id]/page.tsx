import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChatInterface from './ChatInterface'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  if (!session?.user) {
    redirect('/signin')
  }

  return <ChatInterface conversationId={id} user={session.user} />
}
