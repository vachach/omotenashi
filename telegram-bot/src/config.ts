import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

loadDotenv()

const nonEmpty = (label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)

const adminIdsSchema = z
  .string({ required_error: 'ADMIN_IDS is required' })
  .transform((value, ctx) => {
    const parts = value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)

    if (parts.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ADMIN_IDS must contain at least one id' })
      return z.NEVER
    }

    const ids = parts.map((part) => Number(part))
    if (ids.some((id) => Number.isNaN(id))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'ADMIN_IDS must be a comma-separated list of numbers' })
      return z.NEVER
    }

    return ids
  })

const groupIdSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      const numeric = Number(value)
      if (!Number.isNaN(numeric)) return numeric
      return value.trim()
    }
    if (typeof value === 'number') return value
    return value
  },
  z.union([z.string().min(1), z.number()])
)

const serviceAccountSchema = z
  .string({ required_error: 'GOOGLE_SERVICE_ACCOUNT_JSON is required' })
  .trim()
  .min(1, 'GOOGLE_SERVICE_ACCOUNT_JSON is required')
  .transform((value, ctx) => {
    try {
      const jsonText = Buffer.from(value, 'base64').toString('utf8')
      const parsed = JSON.parse(jsonText) as Record<string, unknown>
      if (!parsed || typeof parsed !== 'object') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'GOOGLE_SERVICE_ACCOUNT_JSON must be valid base64 JSON' })
        return z.NEVER
      }
      return parsed
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'GOOGLE_SERVICE_ACCOUNT_JSON must be valid base64 JSON' })
      return z.NEVER
    }
  })

const envSchema = z.object({
  BOT_TOKEN: nonEmpty('BOT_TOKEN'),
  ADMIN_IDS: adminIdsSchema,
  SHEET_ID: nonEmpty('SHEET_ID'),
  GOOGLE_SERVICE_ACCOUNT_JSON: serviceAccountSchema,
  GROUP_ID: groupIdSchema,
  MEET_LINK: nonEmpty('MEET_LINK'),
  CARD_NUMBER: nonEmpty('CARD_NUMBER'),
  TZ: z.string().default('Asia/Tokyo')
})

const formatError = (error: z.ZodError) =>
  error.issues.map((issue) => `- ${issue.path.join('.') || 'env'}: ${issue.message}`).join('\n')

export type AppConfig = z.infer<typeof envSchema>

// GOOGLE_SERVICE_ACCOUNT_JSON expects base64-encoded JSON from the service account file.
export const loadConfig = (): AppConfig => {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${formatError(parsed.error)}`)
  }
  return parsed.data
}
