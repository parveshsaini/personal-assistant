import { google } from 'googleapis'
import { getCredential, upsertCredential } from '@/lib/db/credentials'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/spreadsheets',
]

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  )
}

export function getAuthUrl(): string {
  const client = createOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  })
}

export async function getAuthorizedClient() {
  const cred = await getCredential('google')
  if (!cred?.access_token) {
    throw new Error('Google not connected. Visit /settings/integrations to connect.')
  }

  const client = createOAuthClient()
  client.setCredentials({
    access_token: cred.access_token,
    refresh_token: cred.refresh_token ?? undefined,
    expiry_date: cred.token_expiry ? new Date(cred.token_expiry).getTime() : undefined,
  })

  // Auto-refresh if token is expired or expiring within 5 minutes
  const expiryMs = cred.token_expiry ? new Date(cred.token_expiry).getTime() : 0
  if (expiryMs < Date.now() + 5 * 60 * 1000) {
    const { credentials } = await client.refreshAccessToken()
    await upsertCredential('google', {
      access_token: credentials.access_token ?? cred.access_token,
      token_expiry: credentials.expiry_date
        ? new Date(credentials.expiry_date).toISOString()
        : cred.token_expiry,
    })
    client.setCredentials(credentials)
  }

  return client
}
