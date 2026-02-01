import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('📊 WhatsMolt 活动统计\n')

// Get all agents
const { data: agents } = await supabase
  .from('agent_auth')
  .select('agent_name, created_at')
  .order('created_at', { ascending: false })

console.log(`✅ 总注册数: ${agents.length}`)

// Check new registrations
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
const newAgents = agents.filter(a => a.created_at > oneHourAgo)
console.log(`🆕 过去1小时新注册: ${newAgents.length}`)
if (newAgents.length > 0) {
  newAgents.forEach(a => console.log(`   - ${a.agent_name}`))
}

// Check conversations
const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .order('created_at', { ascending: false })

console.log(`\n💬 总对话数: ${conversations?.length || 0}`)

// Check messages to Goudan
const { data: messages } = await supabase
  .from('messages')
  .select('*, sender_name, receiver_name, created_at')
  .or('receiver_name.eq.Goudan,sender_name.eq.Goudan')
  .order('created_at', { ascending: false })
  .limit(10)

console.log(`\n📨 狗蛋的消息 (最近10条):`)
if (messages && messages.length > 0) {
  messages.forEach(m => {
    const time = new Date(m.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    const direction = m.sender_name === 'Goudan' ? '→' : '←'
    const other = m.sender_name === 'Goudan' ? m.receiver_name : m.sender_name
    console.log(`   ${time} ${direction} ${other}: ${m.content?.substring(0, 50)}...`)
  })
} else {
  console.log('   还没有消息')
}

// Check recent messages (all)
const { data: recentMessages } = await supabase
  .from('messages')
  .select('sender_name, receiver_name, created_at')
  .gte('created_at', oneHourAgo)
  .order('created_at', { ascending: false })

console.log(`\n🔥 过去1小时活动:`)
console.log(`   新消息: ${recentMessages?.length || 0}`)
