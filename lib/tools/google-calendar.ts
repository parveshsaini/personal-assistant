import { google } from 'googleapis'
import { getAuthorizedClient } from '@/lib/integrations/google-oauth'

export async function getCalendarEvents(args: {
  start_date: string
  end_date: string
  calendar_id?: string
}) {
  const auth = await getAuthorizedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const res = await calendar.events.list({
    calendarId: args.calendar_id ?? 'primary',
    timeMin: new Date(args.start_date).toISOString(),
    timeMax: new Date(args.end_date).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  })

  const events = (res.data.items ?? []).map((e) => ({
    id: e.id,
    title: e.summary,
    start: e.start?.dateTime ?? e.start?.date,
    end: e.end?.dateTime ?? e.end?.date,
    location: e.location,
    attendees: (e.attendees ?? []).map((a) => a.email),
    description: e.description,
  }))

  return { events, count: events.length }
}

export async function createCalendarEvent(args: {
  title: string
  start_datetime: string
  end_datetime: string
  attendees?: string[]
  description?: string
  location?: string
}) {
  const auth = await getAuthorizedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: args.title,
      start: { dateTime: args.start_datetime },
      end: { dateTime: args.end_datetime },
      attendees: (args.attendees ?? []).map((email) => ({ email })),
      description: args.description,
      location: args.location,
    },
  })

  return {
    id: res.data.id,
    title: res.data.summary,
    start: res.data.start?.dateTime,
    end: res.data.end?.dateTime,
    htmlLink: res.data.htmlLink,
    status: 'created',
  }
}

export async function checkAvailability(args: {
  date: string
  duration_minutes: number
  attendees?: string[]
}) {
  const auth = await getAuthorizedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const dayStart = new Date(`${args.date}T08:00:00`)
  const dayEnd = new Date(`${args.date}T18:00:00`)

  const items = [{ id: 'primary' }, ...(args.attendees ?? []).map((email) => ({ id: email }))]

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      items,
    },
  })

  // Collect all busy periods
  const busySlots: Array<{ start: Date; end: Date }> = []
  for (const cal of Object.values(res.data.calendars ?? {})) {
    for (const busy of cal.busy ?? []) {
      if (busy.start && busy.end) {
        busySlots.push({ start: new Date(busy.start), end: new Date(busy.end) })
      }
    }
  }
  busySlots.sort((a, b) => a.start.getTime() - b.start.getTime())

  // Find free slots
  const durationMs = args.duration_minutes * 60 * 1000
  const freeSlots: Array<{ start: string; end: string }> = []
  let cursor = dayStart

  for (const busy of busySlots) {
    if (cursor.getTime() + durationMs <= busy.start.getTime()) {
      freeSlots.push({
        start: cursor.toISOString(),
        end: new Date(cursor.getTime() + durationMs).toISOString(),
      })
    }
    if (busy.end > cursor) cursor = busy.end
  }

  if (cursor.getTime() + durationMs <= dayEnd.getTime()) {
    freeSlots.push({
      start: cursor.toISOString(),
      end: new Date(cursor.getTime() + durationMs).toISOString(),
    })
  }

  return { date: args.date, duration_minutes: args.duration_minutes, free_slots: freeSlots.slice(0, 5) }
}

export async function updateCalendarEvent(args: {
  event_id: string
  title?: string
  start_datetime?: string
  end_datetime?: string
  description?: string
}) {
  const auth = await getAuthorizedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const patch: Record<string, unknown> = {}
  if (args.title) patch.summary = args.title
  if (args.start_datetime) patch.start = { dateTime: args.start_datetime }
  if (args.end_datetime) patch.end = { dateTime: args.end_datetime }
  if (args.description !== undefined) patch.description = args.description

  const res = await calendar.events.patch({
    calendarId: 'primary',
    eventId: args.event_id,
    requestBody: patch,
  })

  return { id: res.data.id, title: res.data.summary, status: 'updated' }
}
