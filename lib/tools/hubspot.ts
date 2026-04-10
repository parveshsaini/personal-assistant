import { getHubSpotToken } from '@/lib/integrations/hubspot-oauth'

const BASE = 'https://api.hubspot.com'

async function hubspotFetch(path: string, options: RequestInit = {}) {
  const token = await getHubSpotToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`HubSpot API error ${res.status}: ${data.message ?? JSON.stringify(data)}`)
  }
  return data
}

// ── search_hubspot_contacts ────────────────────────────────────────────────────
export async function searchHubSpotContacts(args: {
  query: string
  limit?: number
}) {
  const { query, limit = 10 } = args

  const body = {
    query,
    limit,
    properties: ['firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle', 'hs_lead_status'],
    sorts: [{ propertyName: 'lastmodifieddate', direction: 'DESCENDING' }],
  }

  const data = await hubspotFetch('/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const contacts = (data.results ?? []).map((c: Record<string, unknown>) => {
    const p = c.properties as Record<string, string>
    return {
      id: c.id,
      name: [p.firstname, p.lastname].filter(Boolean).join(' ') || 'Unknown',
      email: p.email ?? null,
      phone: p.phone ?? null,
      company: p.company ?? null,
      job_title: p.jobtitle ?? null,
      lead_status: p.hs_lead_status ?? null,
    }
  })

  return { contacts, total: data.total ?? contacts.length }
}

// ── get_hubspot_deals ──────────────────────────────────────────────────────────
export async function getHubSpotDeals(args: {
  stage?: string
  limit?: number
  search?: string
}) {
  const { stage, limit = 10, search } = args

  let data
  if (search || stage) {
    const filters = []
    if (stage) filters.push({ propertyName: 'dealstage', operator: 'EQ', value: stage })

    const body: Record<string, unknown> = {
      limit,
      properties: ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline', 'hubspot_owner_id'],
      sorts: [{ propertyName: 'closedate', direction: 'ASCENDING' }],
    }
    if (filters.length) body.filterGroups = [{ filters }]
    if (search) body.query = search

    data = await hubspotFetch('/crm/v3/objects/deals/search', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } else {
    data = await hubspotFetch(
      `/crm/v3/objects/deals?limit=${limit}&properties=dealname,amount,dealstage,closedate,pipeline`
    )
  }

  const deals = (data.results ?? []).map((d: Record<string, unknown>) => {
    const p = d.properties as Record<string, string>
    return {
      id: d.id,
      name: p.dealname ?? 'Unnamed deal',
      amount: p.amount ? parseFloat(p.amount) : null,
      stage: p.dealstage ?? null,
      pipeline: p.pipeline ?? null,
      close_date: p.closedate ?? null,
    }
  })

  return { deals, total: data.total ?? deals.length }
}

// ── create_hubspot_contact ─────────────────────────────────────────────────────
export async function createHubSpotContact(args: {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  job_title?: string
}) {
  const { email, first_name, last_name, phone, company, job_title } = args

  const properties: Record<string, string> = { email }
  if (first_name) properties.firstname = first_name
  if (last_name) properties.lastname = last_name
  if (phone) properties.phone = phone
  if (company) properties.company = company
  if (job_title) properties.jobtitle = job_title

  const data = await hubspotFetch('/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  })

  const p = data.properties as Record<string, string>
  return {
    created: true,
    id: data.id,
    name: [p.firstname, p.lastname].filter(Boolean).join(' ') || email,
    email: p.email,
  }
}

// ── get_hubspot_tickets ────────────────────────────────────────────────────────
export async function getHubSpotTickets(args: {
  stage?: string
  priority?: string
  search?: string
  limit?: number
}) {
  const { stage, priority, search, limit = 10 } = args

  const filters = []
  if (stage) filters.push({ propertyName: 'hs_pipeline_stage', operator: 'EQ', value: stage })
  if (priority) filters.push({ propertyName: 'hs_ticket_priority', operator: 'EQ', value: priority.toUpperCase() })

  const body: Record<string, unknown> = {
    limit,
    properties: ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_priority', 'createdate', 'hs_lastmodifieddate'],
    sorts: [{ propertyName: 'hs_lastmodifieddate', direction: 'DESCENDING' }],
  }
  if (filters.length) body.filterGroups = [{ filters }]
  if (search) body.query = search

  const data = await hubspotFetch('/crm/v3/objects/tickets/search', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const tickets = (data.results ?? []).map((t: Record<string, unknown>) => {
    const p = t.properties as Record<string, string>
    return {
      id: t.id,
      subject: p.subject ?? 'Untitled ticket',
      content: p.content ?? null,
      stage: p.hs_pipeline_stage ?? null,
      priority: p.hs_ticket_priority ?? null,
      created_at: p.createdate ?? null,
      updated_at: p.hs_lastmodifieddate ?? null,
    }
  })

  return { tickets, total: data.total ?? tickets.length }
}

// ── create_hubspot_ticket ──────────────────────────────────────────────────────
export async function createHubSpotTicket(args: {
  subject: string
  content?: string
  stage?: string
  priority?: string
}) {
  const { subject, content, stage, priority } = args

  const properties: Record<string, string> = { subject }
  if (content) properties.content = content
  // Default pipeline stage: 1 = "New" in HubSpot's default support pipeline
  properties.hs_pipeline = '0'
  properties.hs_pipeline_stage = stage ?? '1'
  if (priority) properties.hs_ticket_priority = priority.toUpperCase()

  const data = await hubspotFetch('/crm/v3/objects/tickets', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  })

  const p = data.properties as Record<string, string>
  return {
    created: true,
    id: data.id,
    subject: p.subject,
    stage: p.hs_pipeline_stage ?? null,
    priority: p.hs_ticket_priority ?? null,
  }
}

// ── update_hubspot_ticket ──────────────────────────────────────────────────────
export async function updateHubSpotTicket(args: {
  ticket_id: string
  subject?: string
  content?: string
  stage?: string
  priority?: string
}) {
  const { ticket_id, subject, content, stage, priority } = args

  const properties: Record<string, string> = {}
  if (subject) properties.subject = subject
  if (content) properties.content = content
  if (stage) properties.hs_pipeline_stage = stage
  if (priority) properties.hs_ticket_priority = priority.toUpperCase()

  if (!Object.keys(properties).length) {
    throw new Error('At least one field (subject, content, stage, or priority) must be provided to update a ticket.')
  }

  const data = await hubspotFetch(`/crm/v3/objects/tickets/${ticket_id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  })

  const p = data.properties as Record<string, string>
  return {
    updated: true,
    id: data.id,
    subject: p.subject ?? 'Unknown ticket',
    stage: p.hs_pipeline_stage ?? null,
    priority: p.hs_ticket_priority ?? null,
  }
}

// ── delete_hubspot_ticket ──────────────────────────────────────────────────────
export async function deleteHubSpotTicket(args: { ticket_id: string }) {
  const { ticket_id } = args

  // HubSpot DELETE moves the object to the recycling bin (soft delete)
  await hubspotFetch(`/crm/v3/objects/tickets/${ticket_id}`, { method: 'DELETE' })

  return { deleted: true, ticket_id, message: `Ticket ${ticket_id} moved to recycle bin.` }
}

// ── update_hubspot_deal ────────────────────────────────────────────────────────
export async function updateHubSpotDeal(args: {
  deal_id: string
  stage?: string
  amount?: number
  close_date?: string
  name?: string
}) {
  const { deal_id, stage, amount, close_date, name } = args

  const properties: Record<string, string> = {}
  if (stage) properties.dealstage = stage
  if (amount !== undefined) properties.amount = String(amount)
  if (close_date) properties.closedate = close_date
  if (name) properties.dealname = name

  if (!Object.keys(properties).length) {
    throw new Error('At least one field (stage, amount, close_date, or name) must be provided to update a deal.')
  }

  const data = await hubspotFetch(`/crm/v3/objects/deals/${deal_id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  })

  const p = data.properties as Record<string, string>
  return {
    updated: true,
    id: data.id,
    name: p.dealname ?? 'Unknown deal',
    stage: p.dealstage ?? null,
    amount: p.amount ? parseFloat(p.amount) : null,
  }
}
