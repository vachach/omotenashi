import { DateTime } from 'luxon'
import { loadConfig } from '../config'

const config = loadConfig()

export const nextSaturdayAt20 = () => {
  const now = DateTime.now().setZone(config.TZ)
  const saturday = now.set({ weekday: 6, hour: 20, minute: 0, second: 0, millisecond: 0 })
  if (now <= saturday) return saturday
  return saturday.plus({ weeks: 1 })
}
