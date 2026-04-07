import { google } from 'googleapis'
import { getAuthorizedClient } from '@/lib/integrations/google-oauth'

function qualifiedRange(range: string, sheetName?: string): string {
  return sheetName ? `${sheetName}!${range}` : range
}

export async function readSheetRange(args: {
  spreadsheet_id: string
  range: string
  sheet_name?: string
}) {
  const auth = await getAuthorizedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: args.spreadsheet_id,
    range: qualifiedRange(args.range, args.sheet_name),
  })

  return {
    range: res.data.range,
    values: res.data.values ?? [],
    row_count: (res.data.values ?? []).length,
  }
}

export async function writeSheetRange(args: {
  spreadsheet_id: string
  range: string
  values: string[][]
  sheet_name?: string
}) {
  const auth = await getAuthorizedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const res = await sheets.spreadsheets.values.update({
    spreadsheetId: args.spreadsheet_id,
    range: qualifiedRange(args.range, args.sheet_name),
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: args.values },
  })

  return {
    updated_range: res.data.updatedRange,
    updated_rows: res.data.updatedRows,
    updated_columns: res.data.updatedColumns,
    updated_cells: res.data.updatedCells,
    status: 'written',
  }
}
