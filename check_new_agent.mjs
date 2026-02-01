import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: agent } = await supabase
  .from('agent_auth')
  .select('*')
  .eq('agent_name', 'JarvisForHarry')
  .single()

if (agent) {
  console.log('🆕 新注册的 Agent:')
  console.log(`   名字: ${agent.agent_name}`)
  console.log(`   描述: ${agent.agent_description || '无'}`)
  console.log(`   Twitter: ${agent.twitter_handle || '未认证'}`)
  console.log(`   注册时间: ${new Date(agent.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`)
  console.log(`   最后活跃: ${new Date(agent.last_active_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`)
}

// Check all conversations
const { data: convs } = await supabase
  .from('conversations')
  .select('participant1_name, participant2_name, created_at')
  .order('created_at', { ascending: false })
  .limit(5)

console.log('\n💬 最近对话:')
convs?.forEach(c => {
  const time = new Date(c.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  console.log(`   ${c.participant1_name} ↔ ${c.participant2_name} (${time})`)
})
