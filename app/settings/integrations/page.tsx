import { isConnected } from '@/lib/db/credentials'
import { IntegrationsClient } from './IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  let googleConnected = false
  let slackConnected = false
  try {
    ;[googleConnected, slackConnected] = await Promise.all([
      isConnected('google'),
      isConnected('slack'),
    ])
  } catch {
    // Tables not yet created — show disconnected state
  }
  return <IntegrationsClient googleConnected={googleConnected} slackConnected={slackConnected} />
}
