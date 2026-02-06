export type LeadStatus =
  | 'NEW'
  | 'TRIAL_BOOKED'
  | 'TRIAL_DONE'
  | 'PAYMENT_SENT'
  | 'PAID_VERIFIED'
  | 'ACTIVE'
  | 'INACTIVE'

export type PaymentStatus = 'PENDING' | 'PAID_VERIFIED' | 'REJECTED'

export type LeadRecord = {
  tgId: number
  username?: string
  name: string
  phone: string
  goal: string
  level: string
  source: string
  status: LeadStatus
  createdAtIso: string
  lastContactIso?: string
}

export type TrialRecord = {
  tgId: number
  trialAtIso: string
  meetLink: string
  bookedAtIso: string
  remind24hSent: boolean
  remind1hSent: boolean
  attended: boolean
  note?: string
}

export type PaymentProof = {
  fileId: string
  type: 'photo' | 'document'
}

export type PaymentRecord = {
  tgId: number
  amount: number
  proofFileId: string
  proofType: 'photo' | 'document'
  submittedAtIso: string
  status: PaymentStatus
  verifiedBy?: number
  verifiedAtIso?: string
}
