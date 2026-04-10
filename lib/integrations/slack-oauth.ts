import { getCredential, upsertCredential } from '@/lib/db/credentials'
import { WebClient } from '@slack/web-api'

const SLACK_AUTH_URL = 'https://slack.com/oauth/v2/authorize'
const SLACK_TOKEN_URL = 'https://slack.com/api/oauth.v2.access'

// Scopes needed for all Slack tools
const SCOPES = [
  'channels:read',
  'channels:history',
  'groups:read',
  'groups:history',
  'chat:write',
  'search:read',
  'users:read',
].join(',')

export function getSlackAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: SCOPES,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`,
  })
  return `${SLACK_AUTH_URL}?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  team: { id: string; name: string }
}> {
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    client_secret: process.env.SLACK_CLIENT_SECRET!,
    code,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`,
  })

  const res = await fetch(`${SLACK_TOKEN_URL}?${params}`, { method: 'POST' })
  const data = await res.json()

  if (!data.ok) {
    throw new Error(`Slack token exchange failed: ${data.error}`)
  }

  return { access_token: data.access_token, team: data.team }
}

export async function getSlackClient(): Promise<WebClient> {
  const cred = await getCredential('slack')
  if (!cred?.access_token) {
    throw new Error('Slack is not connected. Please connect Slack in Settings > Integrations.')
  }
  return new WebClient(cred.access_token)
}

export async function storeSlackCredential(access_token: string, scopes: string[]) {
  await upsertCredential('slack', {
    access_token,
    refresh_token: null,     // Slack tokens don't expire
    token_expiry: null,
    scopes,
  })
}
