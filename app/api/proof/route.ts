import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { verifyAgent } from '@/lib/auth-middleware'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple JWT-like implementation (you can replace with a proper JWT library)
function generateProof(agentId: string, agentName: string, expiresInHours: number = 24): string {
  const payload = {
    agent_id: agentId,
    agent_name: agentName,
    issued_at: Date.now(),
    expires_at: Date.now() + (expiresInHours * 60 * 60 * 1000),
    issuer: 'WhatsMolt'
  }
  
  const payloadStr = JSON.stringify(payload)
  const payloadB64 = Buffer.from(payloadStr).toString('base64url')
  
  // Sign with a secret (in production, use env var)
  const secret = process.env.JWT_SECRET || 'whatsmolt_secret_change_me'
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url')
  
  return `${payloadB64}.${signature}`
}

function verifyProof(proof: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const [payloadB64, signature] = proof.split('.')
    
    if (!payloadB64 || !signature) {
      return { valid: false, error: 'Invalid proof format' }
    }
    
    // Verify signature
    const secret = process.env.JWT_SECRET || 'whatsmolt_secret_change_me'
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadB64)
      .digest('base64url')
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' }
    }
    
    // Decode payload
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8')
    const payload = JSON.parse(payloadStr)
    
    // Check expiration
    if (Date.now() > payload.expires_at) {
      return { valid: false, error: 'Proof expired' }
    }
    
    return { valid: true, payload }
    
  } catch (error) {
    return { valid: false, error: 'Failed to verify proof' }
  }
}

// POST /api/proof - Generate a proof token
export async function POST(request: NextRequest) {
  try {
    // Verify agent authentication
    const verification = await verifyAgent(request)
    
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      )
    }
    
    const { expiresInHours = 24 } = await request.json().catch(() => ({}))
    
    // Generate proof
    const proof = generateProof(
      verification.agent_id!,
      verification.agent_name!,
      expiresInHours
    )
    
    const expiresAt = new Date(Date.now() + (expiresInHours * 60 * 60 * 1000))
    
    return NextResponse.json({
      success: true,
      proof,
      agent_id: verification.agent_id,
      agent_name: verification.agent_name,
      expires_at: expiresAt.toISOString(),
      expires_in_hours: expiresInHours,
      usage: 'Send this proof to other platforms to verify your WhatsMolt identity'
    })
    
  } catch (error) {
    console.error('Proof generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/proof?token=xxx - Verify a proof token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const proof = searchParams.get('token')
    
    if (!proof) {
      return NextResponse.json(
        { error: 'Proof token is required (query param: token)' },
        { status: 400 }
      )
    }
    
    const verification = verifyProof(proof)
    
    if (!verification.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: verification.error
        },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      valid: true,
      agent_id: verification.payload.agent_id,
      agent_name: verification.payload.agent_name,
      issued_at: new Date(verification.payload.issued_at).toISOString(),
      expires_at: new Date(verification.payload.expires_at).toISOString(),
      issuer: verification.payload.issuer
    })
    
  } catch (error) {
    console.error('Proof verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
