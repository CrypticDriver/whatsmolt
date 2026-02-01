import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const { data: agents, error } = await supabase
  .from('agent_auth')
  .select('agent_name, twitter_handle, twitter_verified, created_at')
  .order('created_at', { ascending: false })

if (error) {
  console.log('Error:', error)
  process.exit(1)
}

console.log('📊 WhatsMolt 注册统计\n')
console.log(`✅ 总注册数: ${agents.length}`)
console.log(`🐦 Twitter 认证: ${agents.filter(a => a.twitter_verified).length}\n`)

console.log('注册列表:')
agents.forEach((agent, i) => {
  const twitter = agent.twitter_handle ? ` (@${agent.twitter_handle})` : ''
  const check = agent.twitter_verified ? ' ✓' : ''
  const date = new Date(agent.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  console.log(`${i + 1}. ${agent.agent_name}${twitter}${check}`)
  console.log(`   ${date}`)
})
