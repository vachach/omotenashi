import { sheetsClient } from './client'
import { env } from '../config'
import { LeadInput, PaymentRecord, Status, TrialRecord, UserRecord } from '../types'
import { log } from '../logger'

const SHEETS = {
  USERS: 'Users',
  LEADS: 'Leads',
  TRIALS: 'Trials',
  PAYMENTS: 'Payments'
}

const headers = {
  [SHEETS.USERS]: [
    'telegram_id',
    'username',
    'name',
    'phone',
    'status',
    'goal',
    'level',
    'source',
    'created_at',
    'updated_at'
  ],
  [SHEETS.LEADS]: [
    'created_at',
    'telegram_id',
    'name',
    'phone',
    'goal',
    'level',
    'source',
    'status'
  ],
  [SHEETS.TRIALS]: [
    'created_at',
    'telegram_id',
    'name',
    'phone',
    'trial_at',
    'status',
    'reminder_24h_sent',
    'reminder_1h_sent',
    'notes'
  ],
  [SHEETS.PAYMENTS]: [
    'created_at',
    'payment_id',
    'telegram_id',
    'name',
    'phone',
    'file_id',
    'file_type',
    'status',
    'admin_by',
    'admin_at',
    'note'
  ]
}

const range = (sheet: string, suffix = '') => `${sheet}${suffix}`

export class SheetsRepo {
  private sheets = sheetsClient()

  async ensureHeaders() {
    for (const sheet of Object.values(SHEETS)) {
      const headerRange = range(sheet, '!A1:Z1')
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: env.SHEET_ID,
        range: headerRange
      })
      const row = res.data.values?.[0]
      if (!row || row.length === 0 || row[0] === '') {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: env.SHEET_ID,
          range: headerRange,
          valueInputOption: 'RAW',
          requestBody: { values: [headers[sheet]] }
        })
        log.info(`Initialized headers for ${sheet}`)
      }
    }
  }

  async appendLead(input: LeadInput, status: Status) {
    const values = [[
      new Date().toISOString(),
      String(input.telegramId),
      input.name,
      input.phone,
      input.goal,
      input.level,
      input.source,
      status
    ]]
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.LEADS),
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  }

  async upsertUser(record: UserRecord) {
    const existing = await this.findUserRow(record.telegramId)
    const values = [[
      String(record.telegramId),
      record.username || '',
      record.name,
      record.phone,
      record.status,
      record.goal,
      record.level,
      record.source,
      record.createdAt,
      record.updatedAt
    ]]

    if (existing) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: env.SHEET_ID,
        range: range(SHEETS.USERS, `!A${existing}:J${existing}`),
        valueInputOption: 'RAW',
        requestBody: { values }
      })
      return
    }

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS),
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  }

  async getUserByTelegramId(telegramId: number): Promise<UserRecord | null> {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS)
    })
    const rows = res.data.values || []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row?.[0] === String(telegramId)) {
        return {
          telegramId,
          username: row?.[1] || undefined,
          name: row?.[2] || '',
          phone: row?.[3] || '',
          status: (row?.[4] as Status) || Status.NEW,
          goal: row?.[5] || '',
          level: row?.[6] || '',
          source: row?.[7] || '',
          createdAt: row?.[8] || new Date().toISOString(),
          updatedAt: row?.[9] || new Date().toISOString()
        }
      }
    }
    return null
  }

  async listUsersByStatus(status: Status) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS)
    })
    const rows = res.data.values || []
    return rows
      .slice(1)
      .filter((row) => row?.[4] === status)
      .map((row) => ({
        telegramId: row?.[0],
        name: row?.[2],
        phone: row?.[3],
        status: row?.[4]
      }))
  }

  async updateUserStatus(telegramId: number, status: Status) {
    const row = await this.findUserRow(telegramId)
    if (!row) return
    const now = new Date().toISOString()
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS, `!E${row}:E${row}`),
      valueInputOption: 'RAW',
      requestBody: { values: [[status]] }
    })
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS, `!J${row}:J${row}`),
      valueInputOption: 'RAW',
      requestBody: { values: [[now]] }
    })
  }

  async appendTrial(trial: TrialRecord) {
    const values = [[
      new Date().toISOString(),
      String(trial.telegramId),
      trial.name,
      trial.phone,
      trial.trialAt,
      trial.status,
      trial.reminder24hSent ? 'TRUE' : 'FALSE',
      trial.reminder1hSent ? 'TRUE' : 'FALSE',
      ''
    ]]
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.TRIALS),
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  }

  async hasUpcomingTrial(telegramId: number, nowIso: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.TRIALS)
    })
    const rows = res.data.values || []
    return rows
      .slice(1)
      .some((row) => row?.[1] === String(telegramId) && row?.[4] >= nowIso)
  }

  async appendPayment(payment: PaymentRecord) {
    const values = [[
      new Date().toISOString(),
      payment.paymentId,
      String(payment.telegramId),
      payment.name,
      payment.phone,
      payment.fileId,
      payment.fileType,
      payment.status,
      '',
      '',
      ''
    ]]
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.PAYMENTS),
      valueInputOption: 'RAW',
      requestBody: { values }
    })
  }

  async getPaymentById(paymentId: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.PAYMENTS)
    })
    const rows = res.data.values || []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row?.[1] === paymentId) {
        return {
          paymentId,
          telegramId: Number(row?.[2]),
          name: row?.[3],
          phone: row?.[4],
          fileId: row?.[5],
          fileType: row?.[6],
          status: row?.[7]
        }
      }
    }
    return null
  }

  async updatePaymentStatus(paymentId: string, status: 'APPROVED' | 'REJECTED', adminId: number) {
    const row = await this.findPaymentRow(paymentId)
    if (!row) return
    const now = new Date().toISOString()
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.PAYMENTS, `!H${row}:J${row}`),
      valueInputOption: 'RAW',
      requestBody: { values: [[status, String(adminId), now]] }
    })
  }

  async listLeadsByStatus(status: Status, limit = 10) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.LEADS)
    })
    const rows = res.data.values || []
    const leads = rows
      .slice(1)
      .filter((row) => row?.[7] === status)
      .slice(-limit)
      .map((row) => ({
        createdAt: row?.[0],
        telegramId: row?.[1],
        name: row?.[2],
        phone: row?.[3],
        goal: row?.[4],
        level: row?.[5],
        source: row?.[6],
        status: row?.[7]
      }))
    return leads
  }

  async listUpcomingTrials() {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.TRIALS)
    })
    const rows = res.data.values || []
    return rows.slice(1).map((row) => ({
      createdAt: row?.[0],
      telegramId: row?.[1],
      name: row?.[2],
      phone: row?.[3],
      trialAt: row?.[4],
      status: row?.[5],
      reminder24hSent: row?.[6] === 'TRUE',
      reminder1hSent: row?.[7] === 'TRUE'
    }))
  }

  async listPendingPayments() {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.PAYMENTS)
    })
    const rows = res.data.values || []
    return rows
      .slice(1)
      .filter((row) => row?.[7] === 'PENDING')
      .map((row) => ({
        paymentId: row?.[1],
        telegramId: row?.[2],
        name: row?.[3],
        phone: row?.[4],
        fileId: row?.[5],
        fileType: row?.[6]
      }))
  }

  async markTrialReminder(telegramId: number, trialAt: string, type: '24h' | '1h') {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.TRIALS)
    })
    const rows = res.data.values || []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (row?.[1] === String(telegramId) && row?.[4] === trialAt) {
        const col = type === '24h' ? 'G' : 'H'
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: env.SHEET_ID,
          range: range(SHEETS.TRIALS, `!${col}${i + 1}:${col}${i + 1}`),
          valueInputOption: 'RAW',
          requestBody: { values: [['TRUE']] }
        })
        return
      }
    }
  }

  private async findUserRow(telegramId: number) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.USERS, '!A:A')
    })
    const rows = res.data.values || []
    for (let i = 1; i < rows.length; i++) {
      if (rows[i]?.[0] === String(telegramId)) return i + 1
    }
    return null
  }

  private async findPaymentRow(paymentId: string) {
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: env.SHEET_ID,
      range: range(SHEETS.PAYMENTS, '!B:B')
    })
    const rows = res.data.values || []
    for (let i = 1; i < rows.length; i++) {
      if (rows[i]?.[0] === paymentId) return i + 1
    }
    return null
  }
}
