import { getCredential, upsertCredential } from '@/lib/db/credentials'

const AUTH_URL = 'https://app.hubspot.com/oauth/authorize'
const TOKEN_URL = 'https://api.hubspot.com/oauth/v1/token'

const SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.objects.companies.read',
  'tickets',
].join(' ')

export function getHubSpotAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.HUBSPOT_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`,
    scope: SCOPES,
  })
  return `${AUTH_URL}?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/hubspot/callback`,
      code,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`HubSpot token exchange failed: ${data.message ?? res.statusText}`)
  }
  return data
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.HUBSPOT_CLIENT_ID!,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`HubSpot token refresh failed: ${data.message ?? res.statusText}`)
  }

  const expiry = new Date(Date.now() + data.expires_in * 1000).toISOString()
  await upsertCredential('hubspot', {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    token_expiry: expiry,
  })

  return data.access_token
}

// Returns a valid access token, auto-refreshing if needed
export async function getHubSpotToken(): Promise<string> {
  const cred = await getCredential('hubspot')
  if (!cred?.access_token) {
    throw new Error('HubSpot is not connected. Please connect HubSpot in Settings > Integrations.')
  }

  // Refresh if expired or expiring within 5 minutes
  const expiryMs = cred.token_expiry ? new Date(cred.token_expiry).getTime() : 0
  if (expiryMs < Date.now() + 5 * 60 * 1000) {
    if (!cred.refresh_token) {
      throw new Error('HubSpot token expired and no refresh token available. Please reconnect.')
    }
    return refreshAccessToken(cred.refresh_token)
  }

  return cred.access_token
}
