import { sheetsClient } from './client'
import { loadConfig } from '../config'

const config = loadConfig()
const sheets = sheetsClient()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const isTransient = (err: unknown) => {
  const status = (err as { code?: number })?.code
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

const withRetry = async <T>(fn: () => Promise<T>, label: string) => {
  const attempts = 4
  let delay = 300
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === attempts - 1 || !isTransient(err)) {
        throw err
      }
      await sleep(delay)
      delay *= 2
    }
  }
  throw new Error(`Failed after retries: ${label}`)
}

export const getValues = async (range: string) => {
  return withRetry(async () => {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: config.SHEET_ID,
      range
    })
    return res.data.values ?? []
  }, `getValues:${range}`)
}

export const appendRow = async (sheetName: string, row: (string | number | boolean)[]) => {
  return withRetry(async () => {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.SHEET_ID,
      range: sheetName,
      valueInputOption: 'RAW',
      requestBody: { values: [row] }
    })
  }, `appendRow:${sheetName}`)
}

export const updateCell = async (range: string, value: string | number | boolean) => {
  return withRetry(async () => {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [[value]] }
    })
  }, `updateCell:${range}`)
}

export const batchUpdate = async (values: { range: string; values: (string | number | boolean)[][] }[]) => {
  return withRetry(async () => {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: config.SHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: values
      }
    })
  }, 'batchUpdate')
}
