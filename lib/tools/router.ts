import { getCalendarEvents, createCalendarEvent, checkAvailability, updateCalendarEvent } from './google-calendar'
import { searchEmails, readEmail, sendEmail } from './gmail'
import { readSheetRange, writeSheetRange } from './google-sheets'
import { listSlackChannels, getSlackMessages, sendSlackMessage } from './slack'
import { searchHubSpotContacts, getHubSpotDeals, createHubSpotContact, updateHubSpotDeal, getHubSpotTickets, createHubSpotTicket, updateHubSpotTicket, deleteHubSpotTicket } from './hubspot'
import { searchNotion, getNotionPage, createNotionPage, appendNotionBlocks } from './notion'

type Handler = (args: Record<string, unknown>) => Promise<unknown>

const HANDLERS: Record<string, Handler> = {
  get_calendar_events: (a) => getCalendarEvents(a as Parameters<typeof getCalendarEvents>[0]),
  create_calendar_event: (a) => createCalendarEvent(a as Parameters<typeof createCalendarEvent>[0]),
  check_availability: (a) => checkAvailability(a as Parameters<typeof checkAvailability>[0]),
  update_calendar_event: (a) => updateCalendarEvent(a as Parameters<typeof updateCalendarEvent>[0]),
  search_emails: (a) => searchEmails(a as Parameters<typeof searchEmails>[0]),
  read_email: (a) => readEmail(a as Parameters<typeof readEmail>[0]),
  send_email: (a) => sendEmail(a as Parameters<typeof sendEmail>[0]),
  read_sheet_range: (a) => readSheetRange(a as Parameters<typeof readSheetRange>[0]),
  write_sheet_range: (a) => writeSheetRange(a as Parameters<typeof writeSheetRange>[0]),
  list_slack_channels: (a) => listSlackChannels(a as Parameters<typeof listSlackChannels>[0]),
  get_slack_messages: (a) => getSlackMessages(a as Parameters<typeof getSlackMessages>[0]),
  send_slack_message: (a) => sendSlackMessage(a as Parameters<typeof sendSlackMessage>[0]),
  search_hubspot_contacts: (a) => searchHubSpotContacts(a as Parameters<typeof searchHubSpotContacts>[0]),
  get_hubspot_deals: (a) => getHubSpotDeals(a as Parameters<typeof getHubSpotDeals>[0]),
  create_hubspot_contact: (a) => createHubSpotContact(a as Parameters<typeof createHubSpotContact>[0]),
  update_hubspot_deal: (a) => updateHubSpotDeal(a as Parameters<typeof updateHubSpotDeal>[0]),
  get_hubspot_tickets: (a) => getHubSpotTickets(a as Parameters<typeof getHubSpotTickets>[0]),
  create_hubspot_ticket: (a) => createHubSpotTicket(a as Parameters<typeof createHubSpotTicket>[0]),
  update_hubspot_ticket: (a) => updateHubSpotTicket(a as Parameters<typeof updateHubSpotTicket>[0]),
  delete_hubspot_ticket: (a) => deleteHubSpotTicket(a as Parameters<typeof deleteHubSpotTicket>[0]),
  search_notion: (a) => searchNotion(a as Parameters<typeof searchNotion>[0]),
  get_notion_page: (a) => getNotionPage(a as Parameters<typeof getNotionPage>[0]),
  create_notion_page: (a) => createNotionPage(a as Parameters<typeof createNotionPage>[0]),
  append_notion_blocks: (a) => appendNotionBlocks(a as Parameters<typeof appendNotionBlocks>[0]),
}

export async function routeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const handler = HANDLERS[name]
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`)
  }
  return handler(args)
}
