import cron from 'node-cron'
import { DateTime } from 'luxon'
import pino from 'pino'
import { bot } from '../bot'
import { loadConfig } from '../config'
import { listUpcomingTrials, markTrialReminderSent } from '../crm/crm'

const logger = pino({ name: 'omotenashi-academy-bot' })
const config = loadConfig()

export const startTrialReminders = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = DateTime.now().setZone(config.TZ)
      const window24 = now.plus({ hours: 25 }).toISO() || new Date().toISOString()
      const window1 = now.plus({ hours: 2 }).toISO() || new Date().toISOString()

      const upcoming24 = await listUpcomingTrials(now.toISO() || new Date().toISOString(), window24)
      const upcoming1 = await listUpcomingTrials(now.toISO() || new Date().toISOString(), window1)

      const sendReminder = async (tgId: number, text: string) => {
        await bot.telegram.sendMessage(tgId, text)
      }

      for (const trial of upcoming24) {
        const trialAt = DateTime.fromISO(trial.trialAtIso, { zone: config.TZ })
        if (!trialAt.isValid) continue
        const diffHours = trialAt.diff(now, 'hours').hours
        if (diffHours <= 24 && diffHours >= 0 && !trial.remind24hSent) {
          await sendReminder(
            trial.tgId,
            `Eslatma: sinov darsi 24 soatdan keyin bo‘ladi.\nSana: ${trialAt.toFormat('yyyy-LL-dd HH:mm')}\nMeet: ${trial.meetLink}`
          )
          await markTrialReminderSent(trial.tgId, '24h')
        }
      }

      for (const trial of upcoming1) {
        const trialAt = DateTime.fromISO(trial.trialAtIso, { zone: config.TZ })
        if (!trialAt.isValid) continue
        const diffHours = trialAt.diff(now, 'hours').hours
        if (diffHours <= 1 && diffHours >= 0 && !trial.remind1hSent) {
          await sendReminder(
            trial.tgId,
            `Eslatma: sinov darsi 1 soatdan keyin bo‘ladi.\nSana: ${trialAt.toFormat('yyyy-LL-dd HH:mm')}\nMeet: ${trial.meetLink}`
          )
          await markTrialReminderSent(trial.tgId, '1h')
        }
      }
    } catch (err) {
      logger.error({ err }, 'Reminder cron failed')
    }
  })
}
