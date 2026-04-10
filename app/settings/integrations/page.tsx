import { isConnected } from '@/lib/db/credentials'
import { IntegrationsClient } from './IntegrationsClient'

export const dynamic = 'force-dynamic'

export default async function IntegrationsPage() {
  let googleConnected = false
  let slackConnected = false
  let hubspotConnected = false
  let notionConnected = false
  try {
    ;[googleConnected, slackConnected, hubspotConnected, notionConnected] = await Promise.all([
      isConnected('google'),
      isConnected('slack'),
      isConnected('hubspot'),
      isConnected('notion'),
    ])
  } catch {
    // Tables not yet created — show disconnected state
  }
  return (
    <IntegrationsClient
      googleConnected={googleConnected}
      slackConnected={slackConnected}
      hubspotConnected={hubspotConnected}
      notionConnected={notionConnected}
    />
  )
}
