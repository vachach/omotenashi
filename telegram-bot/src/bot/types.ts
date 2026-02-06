import { Scenes } from 'telegraf'

export type SessionData = {
  registration?: {
    name?: string
    phone?: string
    goal?: string
    level?: string
    source?: string
  }
  broadcast?: {
    status?: string
  }
}

export type BotContext = Scenes.WizardContext & { session: SessionData }
