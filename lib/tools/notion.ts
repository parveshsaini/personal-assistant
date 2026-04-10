import { getNotionToken } from '@/lib/integrations/notion-oauth'

const BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

async function notionFetch(path: string, options: RequestInit = {}) {
  const token = await getNotionToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Notion API error ${res.status}: ${data.message ?? JSON.stringify(data)}`)
  }
  return data
}

// Extracts plain text from a Notion rich_text array
function extractText(richText: Array<{ plain_text?: string }> = []): string {
  return richText.map((t) => t.plain_text ?? '').join('')
}

// Extracts the title from a Notion page's properties
function extractTitle(properties: Record<string, unknown>): string {
  for (const val of Object.values(properties)) {
    const prop = val as Record<string, unknown>
    if (prop.type === 'title' && Array.isArray(prop.title)) {
      return extractText(prop.title as Array<{ plain_text?: string }>)
    }
  }
  return 'Untitled'
}

// ── search_notion ──────────────────────────────────────────────────────────────
export async function searchNotion(args: { query: string; filter?: 'page' | 'database'; limit?: number }) {
  const { query, filter, limit = 10 } = args

  const body: Record<string, unknown> = {
    query,
    page_size: limit,
    sort: { direction: 'descending', timestamp: 'last_edited_time' },
  }
  if (filter) body.filter = { value: filter, property: 'object' }

  const data = await notionFetch('/search', { method: 'POST', body: JSON.stringify(body) })

  const results = (data.results ?? []).map((item: Record<string, unknown>) => {
    const isDb = item.object === 'database'
    const props = item.properties as Record<string, unknown> ?? {}
    const titleArr = isDb
      ? ((item.title as Array<{ plain_text?: string }>) ?? [])
      : undefined

    return {
      id: item.id,
      type: item.object,
      title: isDb ? extractText(titleArr ?? []) : extractTitle(props),
      url: item.url ?? null,
      last_edited: item.last_edited_time ?? null,
    }
  })

  return { results, count: results.length }
}

// ── get_notion_page ────────────────────────────────────────────────────────────
export async function getNotionPage(args: { page_id: string }) {
  const { page_id } = args
  const id = page_id.replace(/-/g, '')

  const [page, blocks] = await Promise.all([
    notionFetch(`/pages/${id}`),
    notionFetch(`/blocks/${id}/children?page_size=50`),
  ])

  const props = page.properties as Record<string, unknown> ?? {}
  const title = extractTitle(props)

  // Convert blocks to readable text
  const content = (blocks.results ?? [])
    .map((block: Record<string, unknown>) => {
      const type = block.type as string
      const blockData = block[type] as Record<string, unknown> ?? {}
      const richText = blockData.rich_text as Array<{ plain_text?: string }> ?? []
      const text = extractText(richText)

      switch (type) {
        case 'heading_1': return `# ${text}`
        case 'heading_2': return `## ${text}`
        case 'heading_3': return `### ${text}`
        case 'bulleted_list_item': return `• ${text}`
        case 'numbered_list_item': return `1. ${text}`
        case 'to_do': return `[${(blockData.checked ? 'x' : ' ')}] ${text}`
        case 'quote': return `> ${text}`
        case 'code': return `\`\`\`\n${text}\n\`\`\``
        case 'divider': return '---'
        case 'paragraph': return text
        default: return text
      }
    })
    .filter(Boolean)
    .join('\n')

  return {
    id: page.id,
    title,
    url: page.url ?? null,
    last_edited: page.last_edited_time ?? null,
    content,
  }
}

// ── create_notion_page ─────────────────────────────────────────────────────────
export async function createNotionPage(args: {
  title: string
  content?: string
  parent_page_id?: string
  parent_database_id?: string
}) {
  const { title, content, parent_page_id, parent_database_id } = args

  if (!parent_page_id && !parent_database_id) {
    throw new Error('Either parent_page_id or parent_database_id must be provided.')
  }

  const parent = parent_database_id
    ? { database_id: parent_database_id.replace(/-/g, '') }
    : { page_id: parent_page_id!.replace(/-/g, '') }

  const children: unknown[] = []
  if (content) {
    // Split content into paragraphs as separate blocks
    const paragraphs = content.split('\n').filter(Boolean)
    for (const text of paragraphs) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
      })
    }
  }

  const body: Record<string, unknown> = {
    parent,
    properties: {
      title: [{ type: 'text', text: { content: title } }],
    },
  }
  if (children.length) body.children = children

  const data = await notionFetch('/pages', { method: 'POST', body: JSON.stringify(body) })

  return {
    created: true,
    id: data.id,
    title,
    url: data.url ?? null,
  }
}

// ── append_notion_blocks ───────────────────────────────────────────────────────
export async function appendNotionBlocks(args: {
  page_id: string
  content: string
  block_type?: 'paragraph' | 'bulleted_list_item' | 'numbered_list_item' | 'to_do' | 'heading_2' | 'quote'
}) {
  const { page_id, content, block_type = 'paragraph' } = args
  const id = page_id.replace(/-/g, '')

  const lines = content.split('\n').filter(Boolean)
  const children = lines.map((line) => ({
    object: 'block',
    type: block_type,
    [block_type]: {
      rich_text: [{ type: 'text', text: { content: line } }],
      ...(block_type === 'to_do' ? { checked: false } : {}),
    },
  }))

  await notionFetch(`/blocks/${id}/children`, {
    method: 'PATCH',
    body: JSON.stringify({ children }),
  })

  return {
    appended: true,
    page_id,
    blocks_added: children.length,
    message: `Added ${children.length} block(s) to the page.`,
  }
}
