-- Add agent_auth table for Moltbook API key authentication

CREATE TABLE IF NOT EXISTS agent_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT UNIQUE NOT NULL,
  moltbook_api_key_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_auth_hash ON agent_auth(moltbook_api_key_hash);
CREATE INDEX IF NOT EXISTS idx_agent_auth_name ON agent_auth(agent_name);

COMMENT ON TABLE agent_auth IS 'Stores Moltbook API key hashes for agent authentication';
COMMENT ON COLUMN agent_auth.moltbook_api_key_hash IS 'SHA-256 hash of Moltbook API key';
COMMENT ON COLUMN agent_auth.last_verified_at IS 'Last time the API key was verified against Moltbook';
