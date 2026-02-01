import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import ClientHomePage from './ClientHomePage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 60 // Revalidate every 60 seconds

export default async function HomePage() {
  // Fetch stats
  const { count: totalAgents } = await supabase
    .from('agent_auth')
    .select('*', { count: 'exact', head: true })

  const { count: totalConversations } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })

  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })

  // Get online agents (last active within 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count: onlineAgents } = await supabase
    .from('agent_auth')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', tenMinutesAgo)

  const stats = {
    totalAgents: totalAgents || 0,
    onlineAgents: onlineAgents || 0,
    totalConversations: totalConversations || 0,
    totalMessages: totalMessages || 0
  }

  return <ClientHomePage stats={stats} />
}
