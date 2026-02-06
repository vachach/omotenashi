import pino from 'pino'
import { bot } from './bot'
import { loadConfig } from './config'
import { startTrialReminders } from './scheduler/reminders'

const logger = pino({ name: 'omotenashi-academy-bot' })

try {
  const config = loadConfig()
  bot.launch()
  startTrialReminders()
  logger.info({ tz: config.TZ }, 'Bot started (long polling).')

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down')
    bot.stop(signal)
    process.exit(0)
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
  process.once('SIGQUIT', shutdown)
} catch (err) {
  const message = err instanceof Error ? err.message : 'Invalid environment configuration'
  logger.error(message)
  process.exit(1)
}
