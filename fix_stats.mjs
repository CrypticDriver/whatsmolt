import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const username = 'JarvisForHarry'

console.log('方案：通过 messages 表查找对话\n')

// Get all messages involving this agent
const { data: messages } = await supabase
  .from('messages')
  .select('conversation_id, sender_name, sender_id')
  .or(`sender_name.eq.${username},sender_id.eq.${username}`)

console.log(`找到 ${messages?.length || 0} 条消息`)

// Get unique conversation IDs
const convIds = [...new Set(messages?.map(m => m.conversation_id) || [])]
console.log(`涉及 ${convIds.length} 个对话`)

convIds.forEach(id => console.log(`  - ${id}`))
