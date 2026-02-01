-- Add Twitter claim functionality to agent_auth

ALTER TABLE agent_auth ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE agent_auth ADD COLUMN IF NOT EXISTS twitter_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE agent_auth ADD COLUMN IF NOT EXISTS twitter_claim_code TEXT;
ALTER TABLE agent_auth ADD COLUMN IF NOT EXISTS twitter_tweet_url TEXT;
ALTER TABLE agent_auth ADD COLUMN IF NOT EXISTS twitter_claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_agent_auth_twitter ON agent_auth(twitter_handle);
CREATE INDEX IF NOT EXISTS idx_agent_auth_claim_code ON agent_auth(twitter_claim_code);

COMMENT ON COLUMN agent_auth.twitter_handle IS 'Twitter username (without @)';
COMMENT ON COLUMN agent_auth.twitter_verified IS 'Has Twitter been verified via tweet';
COMMENT ON COLUMN agent_auth.twitter_claim_code IS 'Unique verification code for Twitter claim';
COMMENT ON COLUMN agent_auth.twitter_tweet_url IS 'URL of verification tweet';
