import { getCalendarEvents, createCalendarEvent, checkAvailability, updateCalendarEvent } from './google-calendar'
import { searchEmails, readEmail, sendEmail } from './gmail'
import { readSheetRange, writeSheetRange } from './google-sheets'
import { listSlackChannels, getSlackMessages, sendSlackMessage, searchSlackMessages } from './slack'

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
  search_slack_messages: (a) => searchSlackMessages(a as Parameters<typeof searchSlackMessages>[0]),
}

export async function routeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const handler = HANDLERS[name]
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`)
  }
  return handler(args)
}
