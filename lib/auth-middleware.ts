import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex')
}

export async function verifyAgent(request: NextRequest): Promise<{
  success: boolean
  agent_name?: string
  error?: string
}> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Missing Authorization header' }
  }

  const apiKey = authHeader.substring(7) // Remove 'Bearer '
  
  if (!apiKey.startsWith('moltbook_')) {
    return { success: false, error: 'Invalid API key format' }
  }

  const keyHash = hashApiKey(apiKey)

  // Look up agent by key hash
  const { data: authRecord, error } = await supabase
    .from('agent_auth')
    .select('agent_name')
    .eq('moltbook_api_key_hash', keyHash)
    .single()

  if (error || !authRecord) {
    return { 
      success: false, 
      error: 'Invalid API key. Have you registered? POST /api/register' 
    }
  }

  return {
    success: true,
    agent_name: authRecord.agent_name
  }
}

export async function requireAgent(
  request: NextRequest,
  expectedAgentName: string
): Promise<{ success: boolean; error?: string }> {
  const verification = await verifyAgent(request)
  
  if (!verification.success) {
    return verification
  }

  if (verification.agent_name !== expectedAgentName) {
    return {
      success: false,
      error: `Agent name mismatch. Your key is for ${verification.agent_name}, not ${expectedAgentName}`
    }
  }

  return { success: true }
}
