import { getDb } from './client'
import type { IntegrationCredential } from './schema'

type Integration = IntegrationCredential['integration']

export async function getCredential(integration: Integration): Promise<IntegrationCredential | null> {
  const db = getDb()
  const { data, error } = await db
    .from('integration_credentials')
    .select('*')
    .eq('integration', integration)
    .single()
  if (error?.code === 'PGRST116') return null // not found
  if (error) throw error
  return data
}

export async function upsertCredential(
  integration: Integration,
  values: Partial<Omit<IntegrationCredential, 'integration'>>
): Promise<void> {
  const db = getDb()
  const { error } = await db
    .from('integration_credentials')
    .upsert({ integration, ...values, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function deleteCredential(integration: Integration): Promise<void> {
  const db = getDb()
  const { error } = await db
    .from('integration_credentials')
    .delete()
    .eq('integration', integration)
  if (error) throw error
}

export async function isConnected(integration: Integration): Promise<boolean> {
  const cred = await getCredential(integration)
  return cred !== null && cred.access_token !== null
}
