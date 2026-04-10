import { getSlackClient } from '@/lib/integrations/slack-oauth'

// ── list_slack_channels ────────────────────────────────────────────────────────
export async function listSlackChannels(args: { limit?: number }) {
  const client = await getSlackClient()
  const { limit = 30 } = args

  const res = await client.conversations.list({
    limit,
    types: 'public_channel,private_channel',
    exclude_archived: true,
  })

  if (!res.ok) throw new Error(`Slack API error: ${res.error}`)

  const channels = (res.channels ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    is_private: c.is_private,
    num_members: c.num_members,
    topic: c.topic?.value || null,
  }))

  return { channels, count: channels.length }
}

// ── get_slack_messages ─────────────────────────────────────────────────────────
export async function getSlackMessages(args: {
  channel_id: string
  limit?: number
  oldest?: string
}) {
  const client = await getSlackClient()
  const { channel_id, limit = 20, oldest } = args

  const params: Parameters<typeof client.conversations.history>[0] = {
    channel: channel_id,
    limit,
  }
  if (oldest) params.oldest = oldest

  const res = await client.conversations.history(params)
  if (!res.ok) throw new Error(`Slack API error: ${res.error}`)

  // Resolve user display names
  const userCache: Record<string, string> = {}
  const resolveUser = async (userId: string) => {
    if (userCache[userId]) return userCache[userId]
    try {
      const info = await client.users.info({ user: userId })
      const name = info.user?.real_name || info.user?.name || userId
      userCache[userId] = name
      return name
    } catch {
      return userId
    }
  }

  const messages = await Promise.all(
    (res.messages ?? []).map(async (m) => ({
      ts: m.ts,
      user: m.user ? await resolveUser(m.user) : 'Bot',
      text: m.text ?? '',
      timestamp: m.ts ? new Date(parseFloat(m.ts) * 1000).toISOString() : null,
    }))
  )

  return { messages, channel_id }
}

// ── send_slack_message ─────────────────────────────────────────────────────────
export async function sendSlackMessage(args: {
  channel_id: string
  text: string
  thread_ts?: string
}) {
  const client = await getSlackClient()
  const { channel_id, text, thread_ts } = args

  const params: Parameters<typeof client.chat.postMessage>[0] = {
    channel: channel_id,
    text,
  }
  if (thread_ts) params.thread_ts = thread_ts

  const res = await client.chat.postMessage(params)
  if (!res.ok) throw new Error(`Slack API error: ${res.error}`)

  return {
    sent: true,
    channel_id: res.channel,
    ts: res.ts,
    message: `Message sent to channel ${channel_id}`,
  }
}

// ── search_slack_messages ──────────────────────────────────────────────────────
export async function searchSlackMessages(args: {
  query: string
  count?: number
}) {
  const client = await getSlackClient()
  const { query, count = 10 } = args

  const res = await client.search.messages({ query, count })
  if (!res.ok) throw new Error(`Slack API error: ${res.error}`)

  const matches = (res.messages?.matches ?? []).map((m) => ({
    channel: m.channel?.name ?? m.channel?.id ?? 'unknown',
    user: m.username ?? m.user ?? 'unknown',
    text: m.text ?? '',
    timestamp: m.ts ? new Date(parseFloat(m.ts) * 1000).toISOString() : null,
    permalink: m.permalink ?? null,
  }))

  return { results: matches, count: matches.length, query }
}
