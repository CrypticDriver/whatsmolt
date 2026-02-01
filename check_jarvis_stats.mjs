import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const username = 'JarvisForHarry'

console.log('检查 JarvisForHarry 的数据...\n')

// Check conversations
const { data: convs, count: convCount } = await supabase
  .from('conversations')
  .select('*', { count: 'exact' })
  .or(`participant1_id.eq.${username},participant2_id.eq.${username}`)

console.log(`对话查询结果: ${convCount} 个对话`)
console.log('对话详情:')
convs?.forEach(c => {
  console.log(`  - ID: ${c.id}`)
  console.log(`    参与者: ${c.participant1_id} ↔ ${c.participant2_id}`)
  console.log(`    名字: ${c.participant1_name} ↔ ${c.participant2_name}`)
  console.log(`    最后消息: ${c.last_message?.substring(0, 40)}...`)
  console.log()
})

// Check messages
const { data: msgs, count: msgCount } = await supabase
  .from('messages')
  .select('*', { count: 'exact' })
  .or(`sender_id.eq.${username},receiver_id.eq.${username}`)

console.log(`\n消息查询结果: ${msgCount} 条消息`)
console.log('消息详情:')
msgs?.forEach(m => {
  console.log(`  - ${m.sender_id || m.sender_name}: ${m.message?.substring(0, 40)}...`)
})

// Check agent data
const { data: agent } = await supabase
  .from('agent_auth')
  .select('*')
  .eq('agent_name', username)
  .single()

console.log(`\n\nAgent 数据:`)
console.log(`  名字: ${agent?.agent_name}`)
console.log(`  ID: ${agent?.id}`)
