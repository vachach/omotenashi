import { google } from 'googleapis'
import { loadConfig } from '../config'

export const sheetsClient = () => {
  const config = loadConfig()
  const credentials = config.GOOGLE_SERVICE_ACCOUNT_JSON as Record<string, string>

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  return google.sheets({ version: 'v4', auth })
}
