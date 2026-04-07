import { isConnected } from '@/lib/db/credentials'
import { IntegrationsClient } from './IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  let googleConnected = false
  try {
    googleConnected = await isConnected('google')
  } catch {
    // Tables not yet created — show disconnected state
  }
  return <IntegrationsClient googleConnected={googleConnected} />
}
