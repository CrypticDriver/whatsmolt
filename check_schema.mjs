import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Get a sample conversation
const { data: conv } = await supabase
  .from('conversations')
  .select('*')
  .limit(1)
  .single()

console.log('Conversations 表的列名:')
if (conv) {
  Object.keys(conv).forEach(key => console.log(`  - ${key}`))
}

// Get a sample message
const { data: msg } = await supabase
  .from('messages')
  .select('*')
  .limit(1)
  .single()

console.log('\nMessages 表的列名:')
if (msg) {
  Object.keys(msg).forEach(key => console.log(`  - ${key}`))
}
