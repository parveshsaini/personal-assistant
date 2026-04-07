-- Personal Assistant: initial schema
-- Run this in the Supabase SQL Editor (dashboard → SQL Editor → New query → paste → Run)

-- ──────────────────────────────────────────
-- conversations
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────
-- messages
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT        NOT NULL,
  modality        TEXT        CHECK (modality IN ('text', 'voice')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages (conversation_id, created_at);

-- ──────────────────────────────────────────
-- integration_credentials
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integration_credentials (
  integration   TEXT        PRIMARY KEY CHECK (integration IN ('google', 'slack', 'notion', 'hubspot')),
  access_token  TEXT,
  refresh_token TEXT,
  token_expiry  TIMESTAMPTZ,
  scopes        TEXT[],
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
