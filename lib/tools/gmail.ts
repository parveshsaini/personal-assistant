import { google } from 'googleapis'
import { getAuthorizedClient } from '@/lib/integrations/google-oauth'

function decodeBase64Url(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function extractBody(payload: {
  mimeType?: string | null
  body?: { data?: string | null } | null
  parts?: Array<{ mimeType?: string | null; body?: { data?: string | null } | null }> | null
}): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }
  for (const part of payload.parts ?? []) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return decodeBase64Url(part.body.data)
    }
  }
  return ''
}

export async function searchEmails(args: { query: string; max_results?: number }) {
  const auth = await getAuthorizedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: args.query,
    maxResults: args.max_results ?? 10,
  })

  const messages = await Promise.all(
    (listRes.data.messages ?? []).map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date'],
      })
      const headers = msg.data.payload?.headers ?? []
      const get = (name: string) => headers.find((h) => h.name === name)?.value ?? ''
      return {
        id: m.id,
        from: get('From'),
        to: get('To'),
        subject: get('Subject'),
        date: get('Date'),
        snippet: msg.data.snippet,
      }
    })
  )

  return { messages, count: messages.length }
}

export async function readEmail(args: { message_id: string }) {
  const auth = await getAuthorizedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  const msg = await gmail.users.messages.get({
    userId: 'me',
    id: args.message_id,
    format: 'full',
  })

  const headers = msg.data.payload?.headers ?? []
  const get = (name: string) => headers.find((h) => h.name === name)?.value ?? ''

  return {
    id: msg.data.id,
    from: get('From'),
    to: get('To'),
    subject: get('Subject'),
    date: get('Date'),
    body: msg.data.payload ? extractBody(msg.data.payload as Parameters<typeof extractBody>[0]) : '',
    snippet: msg.data.snippet,
  }
}

export async function sendEmail(args: {
  to: string
  subject: string
  body: string
  cc?: string
  reply_to_message_id?: string
}) {
  const auth = await getAuthorizedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  let threadId: string | undefined
  let references: string | undefined
  let inReplyTo: string | undefined

  if (args.reply_to_message_id) {
    const original = await gmail.users.messages.get({
      userId: 'me',
      id: args.reply_to_message_id,
      format: 'metadata',
      metadataHeaders: ['Message-ID', 'References'],
    })
    threadId = original.data.threadId ?? undefined
    const headers = original.data.payload?.headers ?? []
    inReplyTo = headers.find((h) => h.name === 'Message-ID')?.value ?? undefined
    const refs = headers.find((h) => h.name === 'References')?.value ?? ''
    references = refs ? `${refs} ${inReplyTo}` : inReplyTo
  }

  const ccLine = args.cc ? `Cc: ${args.cc}\r\n` : ''
  const replyLine = inReplyTo ? `In-Reply-To: ${inReplyTo}\r\n` : ''
  const refsLine = references ? `References: ${references}\r\n` : ''

  const raw = Buffer.from(
    `To: ${args.to}\r\n` +
    ccLine +
    `Subject: ${args.subject}\r\n` +
    replyLine +
    refsLine +
    `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
    args.body
  )
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw, threadId },
  })

  return { id: res.data.id, threadId: res.data.threadId, status: 'sent' }
}
