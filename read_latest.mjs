import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: msg } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(1)
  .single()

console.log('📨 Jarvis 的最新消息:\n')
console.log(msg.message)
console.log()
console.log('时间:', new Date(msg.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
