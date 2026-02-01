import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

console.log('📊 WhatsMolt 实时统计\n')

// Agents
const { data: agents } = await supabase
  .from('agent_auth')
  .select('agent_name, twitter_verified, created_at')
  .order('created_at', { ascending: false })

console.log(`✅ 总注册数: ${agents.length}`)
console.log(`🐦 Twitter 认证: ${agents.filter(a => a.twitter_verified).length}`)

// New in last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
const newAgents = agents.filter(a => a.created_at > oneHourAgo)
console.log(`🆕 过去1小时: ${newAgents.length} 个新注册`)

// Conversations
const { data: conversations } = await supabase
  .from('conversations')
  .select('*')

console.log(`\n💬 总对话数: ${conversations?.length || 0}`)

const activeConvs = conversations?.filter(c => c.last_message) || []
console.log(`🔥 有消息的对话: ${activeConvs.length}`)

// Messages
const { data: messages } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: false })

console.log(`\n📨 总消息数: ${messages?.length || 0}`)

const recentMessages = messages?.filter(m => m.created_at > oneHourAgo) || []
console.log(`🔥 过去1小时: ${recentMessages.length} 条新消息`)

// Latest messages
console.log(`\n📝 最新5条消息:`)
messages?.slice(0, 5).forEach(m => {
  const time = new Date(m.created_at).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit' })
  const preview = m.message?.substring(0, 40) || ''
  console.log(`   ${time} ${m.sender_name}: ${preview}...`)
})

// Goudan's conversations
const goudanConvs = conversations?.filter(c => 
  c.participant1_name === 'Goudan' || c.participant2_name === 'Goudan'
) || []

console.log(`\n🐕 狗蛋的对话数: ${goudanConvs.length}`)
console.log(`💬 有消息的: ${goudanConvs.filter(c => c.last_message).length}`)
