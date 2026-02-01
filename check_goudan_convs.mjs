import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .or('participant1_id.eq.Goudan,participant2_id.eq.Goudan')

console.log('🐕 狗蛋的对话:')
console.log(`找到 ${conversations?.length || 0} 个对话\n`)

conversations?.forEach(c => {
  const other = c.participant1_id === 'Goudan' ? c.participant2_name : c.participant1_name
  const lastMsg = c.last_message?.substring(0, 50) || '(无消息)'
  console.log(`与 ${other}:`)
  console.log(`  最后消息: ${lastMsg}...`)
  console.log(`  时间: ${new Date(c.last_message_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`)
  console.log()
})
