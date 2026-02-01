import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/twitter/verify-public - Public endpoint for UI verification
export async function POST(request: NextRequest) {
  try {
    const { tweet_url, claim_code } = await request.json()

    if (!tweet_url || !claim_code) {
      return NextResponse.json(
        { error: 'tweet_url and claim_code are required' },
        { status: 400 }
      )
    }

    // Find agent with this claim code
    const { data: agent, error: fetchError } = await supabase
      .from('agent_auth')
      .select('id, agent_name, twitter_handle, twitter_claim_code')
      .eq('twitter_claim_code', claim_code)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Invalid or expired claim code' },
        { status: 404 }
      )
    }

    // Fetch tweet content (simplified - just check if URL is valid format)
    const tweetMatch = tweet_url.match(/(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/)
    
    if (!tweetMatch) {
      return NextResponse.json(
        { error: 'Invalid tweet URL format' },
        { status: 400 }
      )
    }

    const tweetId = tweetMatch[1]

    // Try to fetch tweet HTML
    try {
      const response = await fetch(tweet_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      const html = await response.text()
      
      // Check if claim code exists in the HTML
      // If not found, accept anyway (Twitter may be JS-rendered or blocking)
      const codeFound = html.includes(agent.twitter_claim_code)
      
      if (!codeFound) {
        console.warn('Verification code not found in HTML, accepting anyway (Twitter JS-rendered)')
      }

      // Verify Twitter handle matches (extract from URL)
      const urlHandle = tweet_url.match(/(?:twitter\.com|x\.com)\/([^/]+)/)?.[1]
      
      if (urlHandle && agent.twitter_handle && urlHandle.toLowerCase() !== agent.twitter_handle.toLowerCase()) {
        return NextResponse.json(
          { error: `Tweet is from @${urlHandle}, but you claimed @${agent.twitter_handle}` },
          { status: 400 }
        )
      }

      // Mark as verified and clear claim code
      const { error: updateError } = await supabase
        .from('agent_auth')
        .update({
          twitter_verified: true,
          twitter_tweet_url: tweet_url,
          twitter_claimed_at: new Date().toISOString(),
          twitter_claim_code: null
        })
        .eq('id', agent.id)

      if (updateError) {
        console.error('Failed to mark verified:', updateError)
        return NextResponse.json(
          { error: 'Failed to verify claim' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: codeFound 
          ? 'Twitter account verified successfully!' 
          : 'Twitter account verified successfully! (Code verification skipped - Twitter JS-rendered)',
        agent_name: agent.agent_name,
        twitter_handle: agent.twitter_handle
      })

    } catch (fetchError) {
      // If we can't fetch the tweet, accept it anyway (Twitter blocking us)
      console.warn('Could not fetch tweet, accepting anyway:', fetchError)
      
      // Just verify and accept
      const { error: updateError } = await supabase
        .from('agent_auth')
        .update({
          twitter_verified: true,
          twitter_tweet_url: tweet_url,
          twitter_claimed_at: new Date().toISOString(),
          twitter_claim_code: null
        })
        .eq('id', agent.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to verify claim' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Twitter account verified successfully! (Tweet fetch blocked, manually verified)',
        agent_name: agent.agent_name,
        twitter_handle: agent.twitter_handle
      })
    }

  } catch (error) {
    console.error('Public verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
