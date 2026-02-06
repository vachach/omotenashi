import { batchUpdate, getValues, appendRow, updateCell } from '../sheets/helpers'
import { loadConfig } from '../config'
import { LeadRecord, LeadStatus, PaymentProof, PaymentRecord, PaymentStatus, TrialRecord } from './types'

const config = loadConfig()

const SHEETS = {
  LEADS: 'Leads',
  TRIALS: 'Trials',
  PAYMENTS: 'Payments'
}

const toColumnLetter = (index: number) => {
  let col = ''
  let n = index + 1
  while (n > 0) {
    const rem = (n - 1) % 26
    col = String.fromCharCode(65 + rem) + col
    n = Math.floor((n - 1) / 26)
  }
  return col
}

const headerMap = async (sheetName: string) => {
  const header = await getValues(`${sheetName}!1:1`)
  const row = header[0] || []
  const map: Record<string, number> = {}
  row.forEach((cell, idx) => {
    if (typeof cell === 'string' && cell.trim().length > 0) {
      map[cell.trim()] = idx
    }
  })
  return map
}

const findRowByTgId = async (sheetName: string, tgId: number) => {
  const values = await getValues(sheetName)
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    if (String(row?.[0] ?? '') === String(tgId)) return { rowIndex: i + 1, row }
  }
  return null
}

const findPaymentRow = async (tgId: number, submittedAtIso: string) => {
  const values = await getValues(SHEETS.PAYMENTS)
  for (let i = 1; i < values.length; i++) {
    const row = values[i]
    if (String(row?.[0] ?? '') === String(tgId) && String(row?.[4] ?? '') === submittedAtIso) {
      return { rowIndex: i + 1, row }
    }
  }
  return null
}

const parseBoolean = (value: unknown) => String(value).toLowerCase() === 'true'

export const upsertLead = async (lead: LeadRecord) => {
  const map = await headerMap(SHEETS.LEADS)
  const existing = await findRowByTgId(SHEETS.LEADS, lead.tgId)
  const row = [
    lead.tgId,
    lead.username ?? '',
    lead.name,
    lead.phone,
    lead.goal,
    lead.level,
    lead.source,
    lead.status,
    lead.createdAtIso,
    lead.lastContactIso ?? ''
  ]

  if (!existing) {
    await appendRow(SHEETS.LEADS, row)
    return
  }

  const updates = Object.entries(map).map(([key, idx]) => {
    const valueMap: Record<string, unknown> = {
      tg_id: lead.tgId,
      username: lead.username ?? '',
      name: lead.name,
      phone: lead.phone,
      goal: lead.goal,
      level: lead.level,
      source: lead.source,
      status: lead.status,
      created_at: lead.createdAtIso,
      last_contact: lead.lastContactIso ?? ''
    }
    return {
      range: `${SHEETS.LEADS}!${toColumnLetter(idx)}${existing.rowIndex}`,
      values: [[valueMap[key] ?? '']]
    }
  })

  await batchUpdate(updates)
}

export const getLeadByTgId = async (tgId: number) => {
  const found = await findRowByTgId(SHEETS.LEADS, tgId)
  if (!found) return null

  const row = found.row
  return {
    tgId: Number(row?.[0]),
    username: row?.[1] || '',
    name: row?.[2] || '',
    phone: row?.[3] || '',
    goal: row?.[4] || '',
    level: row?.[5] || '',
    source: row?.[6] || '',
    status: row?.[7] as LeadStatus,
    createdAtIso: row?.[8] || '',
    lastContactIso: row?.[9] || ''
  } as LeadRecord
}

export const listLeadsByStatus = async (status: LeadStatus, limit = 10) => {
  const rows = await getValues(SHEETS.LEADS)
  return rows
    .slice(1)
    .filter((row) => row?.[7] === status)
    .slice(-limit)
    .map((row) => ({
      tgId: Number(row?.[0]),
      username: row?.[1] || '',
      name: row?.[2] || '',
      phone: row?.[3] || '',
      goal: row?.[4] || '',
      level: row?.[5] || '',
      source: row?.[6] || '',
      status: row?.[7] as LeadStatus,
      createdAtIso: row?.[8] || '',
      lastContactIso: row?.[9] || ''
    })) as LeadRecord[]
}

export const listAllLeads = async () => {
  const rows = await getValues(SHEETS.LEADS)
  return rows
    .slice(1)
    .map((row) => ({
      tgId: Number(row?.[0]),
      username: row?.[1] || '',
      name: row?.[2] || '',
      phone: row?.[3] || '',
      goal: row?.[4] || '',
      level: row?.[5] || '',
      source: row?.[6] || '',
      status: row?.[7] as LeadStatus,
      createdAtIso: row?.[8] || '',
      lastContactIso: row?.[9] || ''
    })) as LeadRecord[]
}

export const setLeadStatus = async (tgId: number, status: LeadStatus) => {
  const map = await headerMap(SHEETS.LEADS)
  const found = await findRowByTgId(SHEETS.LEADS, tgId)
  if (!found) return
  const col = map.status
  if (col === undefined) return
  await updateCell(`${SHEETS.LEADS}!${toColumnLetter(col)}${found.rowIndex}`, status)
}

export const createTrial = async (tgId: number, trialAtIso: string) => {
  const nowIso = new Date().toISOString()
  const row = [
    tgId,
    trialAtIso,
    config.MEET_LINK,
    nowIso,
    false,
    false,
    false,
    ''
  ]
  await appendRow(SHEETS.TRIALS, row)
}

export const listUpcomingTrials = async (fromIso: string, toIso: string) => {
  const rows = await getValues(SHEETS.TRIALS)
  return rows
    .slice(1)
    .filter((row) => row?.[1] >= fromIso && row?.[1] <= toIso)
    .map((row) => ({
      tgId: Number(row?.[0]),
      trialAtIso: row?.[1] || '',
      meetLink: row?.[2] || '',
      bookedAtIso: row?.[3] || '',
      remind24hSent: parseBoolean(row?.[4]),
      remind1hSent: parseBoolean(row?.[5]),
      attended: parseBoolean(row?.[6]),
      note: row?.[7] || ''
    })) as TrialRecord[]
}

export const markTrialReminderSent = async (tgId: number, which: '24h' | '1h') => {
  const found = await findRowByTgId(SHEETS.TRIALS, tgId)
  if (!found) return

  const map = await headerMap(SHEETS.TRIALS)
  const key = which === '24h' ? 'remind_24h_sent' : 'remind_1h_sent'
  const col = map[key]
  if (col === undefined) return
  await updateCell(`${SHEETS.TRIALS}!${toColumnLetter(col)}${found.rowIndex}`, true)
}

export const createPayment = async (tgId: number, amount: number, proof: PaymentProof) => {
  const submittedAtIso = new Date().toISOString()
  const row = [
    tgId,
    amount,
    proof.fileId,
    proof.type,
    submittedAtIso,
    'PENDING',
    '',
    ''
  ]
  await appendRow(SHEETS.PAYMENTS, row)
  return submittedAtIso
}

export const listPendingPayments = async () => {
  const rows = await getValues(SHEETS.PAYMENTS)
  return rows
    .slice(1)
    .filter((row) => row?.[5] === 'PENDING')
    .map((row) => ({
      tgId: Number(row?.[0]),
      amount: Number(row?.[1]),
      proofFileId: row?.[2] || '',
      proofType: row?.[3] || '',
      submittedAtIso: row?.[4] || '',
      status: row?.[5] as PaymentStatus,
      verifiedBy: row?.[6] ? Number(row?.[6]) : undefined,
      verifiedAtIso: row?.[7] || ''
    })) as PaymentRecord[]
}

export const setPaymentStatus = async (
  tgId: number,
  submittedAtIso: string,
  status: PaymentStatus,
  verifiedBy?: number
) => {
  const found = await findPaymentRow(tgId, submittedAtIso)
  if (!found) return

  const map = await headerMap(SHEETS.PAYMENTS)
  const verifiedAtIso = new Date().toISOString()
  const updates = [
    {
      key: 'status',
      value: status
    },
    {
      key: 'verified_by',
      value: verifiedBy ?? ''
    },
    {
      key: 'verified_at_iso',
      value: verifiedBy ? verifiedAtIso : ''
    }
  ]

  await batchUpdate(
    updates
      .map((update) => {
        const col = map[update.key]
        if (col === undefined) return null
        return {
          range: `${SHEETS.PAYMENTS}!${toColumnLetter(col)}${found.rowIndex}`,
          values: [[update.value]]
        }
      })
      .filter((value): value is { range: string; values: (string | number | boolean)[][] } => value !== null)
  )
}
