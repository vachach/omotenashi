import { BotContext } from '../bot/types'
import { SheetsRepo } from '../sheets/repo'
import { env } from '../config'
import { Status } from '../types'

export const ensureAdmin = (ctx: BotContext) => {
  if (!env.ADMIN_IDS.includes(ctx.from!.id)) {
    ctx.reply('Access denied.')
    return false
  }
  return true
}

export const getUsersByStatus = async (repo: SheetsRepo, status: Status) => {
  const res = await repo.listLeadsByStatus(status, 1000)
  return res
}
