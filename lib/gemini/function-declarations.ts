import { Type, type FunctionDeclaration } from '@google/genai'

// Google Calendar (4 tools)
const calendarDeclarations: FunctionDeclaration[] = [
  {
    name: 'get_calendar_events',
    description: 'Fetch calendar events within a date range.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_date: { type: Type.STRING, description: 'ISO 8601 date or datetime (e.g. 2025-01-01 or 2025-01-01T09:00:00)' },
        end_date: { type: Type.STRING, description: 'ISO 8601 date or datetime (exclusive end)' },
        calendar_id: { type: Type.STRING, description: 'Calendar ID, defaults to primary' },
      },
      required: ['start_date', 'end_date'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a new calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Event title/summary' },
        start_datetime: { type: Type.STRING, description: 'ISO 8601 datetime' },
        end_datetime: { type: Type.STRING, description: 'ISO 8601 datetime' },
        attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of attendee email addresses' },
        description: { type: Type.STRING, description: 'Event description/notes' },
        location: { type: Type.STRING, description: 'Event location' },
      },
      required: ['title', 'start_datetime', 'end_datetime'],
    },
  },
  {
    name: 'check_availability',
    description: 'Find available time slots on a given date.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
        duration_minutes: { type: Type.NUMBER, description: 'Required meeting duration in minutes' },
        attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Attendee emails to check (optional)' },
      },
      required: ['date', 'duration_minutes'],
    },
  },
  {
    name: 'update_calendar_event',
    description: 'Update an existing calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        event_id: { type: Type.STRING, description: 'The event ID to update' },
        title: { type: Type.STRING, description: 'New event title' },
        start_datetime: { type: Type.STRING, description: 'New start datetime (ISO 8601)' },
        end_datetime: { type: Type.STRING, description: 'New end datetime (ISO 8601)' },
        description: { type: Type.STRING, description: 'New description' },
      },
      required: ['event_id'],
    },
  },
]

// Gmail (3 tools)
const gmailDeclarations: FunctionDeclaration[] = [
  {
    name: 'search_emails',
    description: 'Search emails using Gmail query syntax.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Gmail search query (e.g. "from:boss@example.com is:unread")' },
        max_results: { type: Type.NUMBER, description: 'Maximum number of results (default 10)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_email',
    description: 'Read the full content of an email by its message ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        message_id: { type: Type.STRING, description: 'Gmail message ID' },
      },
      required: ['message_id'],
    },
  },
  {
    name: 'send_email',
    description: 'Send or reply to an email.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING, description: 'Recipient email address' },
        subject: { type: Type.STRING, description: 'Email subject' },
        body: { type: Type.STRING, description: 'Email body (plain text)' },
        cc: { type: Type.STRING, description: 'CC email address (optional)' },
        reply_to_message_id: { type: Type.STRING, description: 'Message ID to reply to (optional)' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
]

// Google Sheets (2 tools)
const sheetsDeclarations: FunctionDeclaration[] = [
  {
    name: 'read_sheet_range',
    description: 'Read cell values from a Google Sheet range.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        spreadsheet_id: { type: Type.STRING, description: 'Google Sheets spreadsheet ID' },
        range: { type: Type.STRING, description: 'A1 notation range (e.g. "A1:C10")' },
        sheet_name: { type: Type.STRING, description: 'Sheet tab name (optional, defaults to first sheet)' },
      },
      required: ['spreadsheet_id', 'range'],
    },
  },
  {
    name: 'write_sheet_range',
    description: 'Write values to a Google Sheet range.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        spreadsheet_id: { type: Type.STRING, description: 'Google Sheets spreadsheet ID' },
        range: { type: Type.STRING, description: 'A1 notation range (e.g. "A1:C3")' },
        values: {
          type: Type.ARRAY,
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: '2D array of values to write (rows × columns)',
        },
        sheet_name: { type: Type.STRING, description: 'Sheet tab name (optional)' },
      },
      required: ['spreadsheet_id', 'range', 'values'],
    },
  },
]

// Slack (4 tools)
const slackDeclarations: FunctionDeclaration[] = [
  {
    name: 'list_slack_channels',
    description: 'List available Slack channels in the workspace.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        limit: { type: Type.NUMBER, description: 'Max number of channels to return (default 30)' },
      },
    },
  },
  {
    name: 'get_slack_messages',
    description: 'Get recent messages from a Slack channel.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        channel_id: { type: Type.STRING, description: 'Slack channel ID (e.g. C01234ABC)' },
        limit: { type: Type.NUMBER, description: 'Number of messages to retrieve (default 20)' },
        oldest: { type: Type.STRING, description: 'Only fetch messages after this Unix timestamp (optional)' },
      },
      required: ['channel_id'],
    },
  },
  {
    name: 'send_slack_message',
    description: 'Send a message to a Slack channel.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        channel_id: { type: Type.STRING, description: 'Slack channel ID to send the message to' },
        text: { type: Type.STRING, description: 'Message text to send' },
        thread_ts: { type: Type.STRING, description: 'Timestamp of a message to reply in a thread (optional)' },
      },
      required: ['channel_id', 'text'],
    },
  },
]

export const ALL_DECLARATIONS: FunctionDeclaration[] = [
  ...calendarDeclarations,
  ...gmailDeclarations,
  ...sheetsDeclarations,
  ...slackDeclarations,
]
