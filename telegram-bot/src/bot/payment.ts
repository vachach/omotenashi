import { Markup, Scenes } from 'telegraf'
import { BotContext } from './types'
import { SheetsRepo } from '../sheets/repo'
import { Status } from '../types'

export const buildPaymentScene = (repo: SheetsRepo, notifyAdmins: (text: string, extra?: Parameters<typeof Markup.inlineKeyboard>[0]) => Promise<void>) => {
  return new Scenes.WizardScene<BotContext>(
    'payment',
    async (ctx) => {
      await ctx.reply('Please send a screenshot or document as proof of payment.')
      return ctx.wizard.next()
    },
    async (ctx) => {
      let fileId = ''
      let fileType: 'photo' | 'document' = 'photo'

      if (ctx.message && 'photo' in ctx.message) {
        const photos = ctx.message.photo
        fileId = photos[photos.length - 1].file_id
        fileType = 'photo'
      } else if (ctx.message && 'document' in ctx.message) {
        fileId = ctx.message.document.file_id
        fileType = 'document'
      }

      if (!fileId) {
        await ctx.reply('Please send a photo or document file.')
        return
      }

      const user = await repo.getUserByTelegramId(ctx.from!.id)
      if (!user) {
        await ctx.reply('Please register first with /start.')
        return ctx.scene.leave()
      }

      const paymentId = `${ctx.from!.id}_${Date.now()}`

      await repo.appendPayment({
        paymentId,
        telegramId: ctx.from!.id,
        name: user.name,
        phone: user.phone,
        fileId,
        fileType,
        status: 'PENDING'
      })

      await repo.updateUserStatus(ctx.from!.id, Status.PAYMENT_SENT)

      const buttons = Markup.inlineKeyboard([
        [Markup.button.callback('Approve', `pay:approve:${paymentId}`)],
        [Markup.button.callback('Reject', `pay:reject:${paymentId}`)]
      ])

      await notifyAdmins(
        `New payment proof from ${user.name} (${user.phone}). Payment ID: ${paymentId}`,
        buttons
      )

      await ctx.reply('Thanks! Our team will review your payment shortly.')
      return ctx.scene.leave()
    }
  )
}
