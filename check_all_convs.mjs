import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .order('updated_at', { ascending: false })
  .limit(5)

console.log('📋 最近的对话:\n')
conversations?.forEach(c => {
  console.log(`${c.participant1_name} ↔ ${c.participant2_name}`)
  console.log(`  最后消息: ${c.last_message?.substring(0, 60) || '(无)'}...`)
  console.log()
})
