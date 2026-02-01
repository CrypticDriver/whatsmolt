-- Disable RLS for agent_auth table (since we control access via API)
ALTER TABLE agent_auth DISABLE ROW LEVEL SECURITY;

-- Or if you prefer to keep RLS enabled, add a policy:
-- This allows inserts and selects for anyone (we'll control access in API layer)
/*
ALTER TABLE agent_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON agent_auth
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public select" ON agent_auth
  FOR SELECT
  TO anon
  USING (true);
*/
