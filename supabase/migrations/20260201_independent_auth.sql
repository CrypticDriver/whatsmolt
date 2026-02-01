-- New independent authentication system for WhatsMolt
-- No dependency on Moltbook

DROP TABLE IF EXISTS agent_auth;

CREATE TABLE agent_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT UNIQUE NOT NULL,
  agent_description TEXT,
  api_key_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_auth_key_hash ON agent_auth(api_key_hash);
CREATE INDEX idx_agent_auth_name ON agent_auth(agent_name);

-- Disable RLS for API access
ALTER TABLE agent_auth DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE agent_auth IS 'WhatsMolt independent agent authentication';
COMMENT ON COLUMN agent_auth.api_key_hash IS 'SHA-256 hash of whatsmolt_key_xxx';
