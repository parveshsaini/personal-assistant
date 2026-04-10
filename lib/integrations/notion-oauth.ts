import { getCredential } from '@/lib/db/credentials'

const AUTH_URL = 'https://api.notion.com/v1/oauth/authorize'
const TOKEN_URL = 'https://api.notion.com/v1/oauth/token'

export function getNotionAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    response_type: 'code',
    owner: 'user',
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`,
  })
  return `${AUTH_URL}?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string
  workspace_name: string
  workspace_id: string
}> {
  // Notion requires Basic Auth with client_id:client_secret
  const credentials = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/callback`,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Notion token exchange failed: ${data.error ?? res.statusText}`)
  }

  return {
    access_token: data.access_token,
    workspace_name: data.workspace_name,
    workspace_id: data.workspace_id,
  }
}

// Notion tokens never expire — no refresh logic needed
export async function getNotionToken(): Promise<string> {
  const cred = await getCredential('notion')
  if (!cred?.access_token) {
    throw new Error('Notion is not connected. Please connect Notion in Settings > Integrations.')
  }
  return cred.access_token
}
