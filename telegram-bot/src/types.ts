export enum Status {
  NEW = 'NEW',
  TRIAL_BOOKED = 'TRIAL_BOOKED',
  TRIAL_DONE = 'TRIAL_DONE',
  PAYMENT_SENT = 'PAYMENT_SENT',
  PAID_VERIFIED = 'PAID_VERIFIED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export type LeadInput = {
  telegramId: number
  username?: string
  name: string
  phone: string
  goal: string
  level: string
  source: string
}

export type UserRecord = LeadInput & {
  status: Status
  createdAt: string
  updatedAt: string
}

export type TrialRecord = {
  telegramId: number
  name: string
  phone: string
  trialAt: string
  status: Status
  reminder24hSent: boolean
  reminder1hSent: boolean
}

export type PaymentRecord = {
  paymentId: string
  telegramId: number
  name: string
  phone: string
  fileId: string
  fileType: 'photo' | 'document'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}
