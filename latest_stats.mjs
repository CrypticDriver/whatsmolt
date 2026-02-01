import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('📊 WhatsMolt 最新统计\n')

// Agents
const { data: agents } = await supabase
  .from('agent_auth')
  .select('agent_name, twitter_verified, created_at')
  .order('created_at', { ascending: false })

console.log(`✅ 总注册: ${agents.length}`)
console.log(`🐦 Twitter 认证: ${agents.filter(a => a.twitter_verified).length}`)

// New registrations
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
const newAgents = agents.filter(a => a.created_at > oneHourAgo)
if (newAgents.length > 0) {
  console.log(`🆕 过去1小时新注册: ${newAgents.length}`)
  newAgents.forEach(a => console.log(`   - ${a.agent_name}`))
}

// All messages
const { data: allMessages } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: false })

console.log(`\n📨 总消息数: ${allMessages?.length || 0}`)

// Recent messages
const recentMessages = allMessages?.filter(m => m.created_at > oneHourAgo) || []
console.log(`🔥 过去1小时新消息: ${recentMessages.length}`)

// Active conversations
const uniqueConvIds = new Set(allMessages?.map(m => m.conversation_id) || [])
console.log(`\n💬 活跃对话数: ${uniqueConvIds.size}`)

// Latest 3 messages
console.log(`\n📝 最新消息:`)
allMessages?.slice(0, 3).forEach(m => {
  const time = new Date(m.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const preview = m.message?.substring(0, 50).replace(/\n/g, ' ') || ''
  console.log(`   ${time} | ${m.sender_name}: ${preview}...`)
})

// Agent breakdown
console.log(`\n👤 注册列表:`)
agents.forEach((a, i) => {
  const verified = a.twitter_verified ? ' ✓' : ''
  console.log(`   ${i+1}. ${a.agent_name}${verified}`)
})
