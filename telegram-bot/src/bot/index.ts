import { Telegraf, Markup, Scenes, session } from 'telegraf'
import { env } from '../config'
import { SheetsRepo } from '../sheets/repo'
import { buildRegistrationScene } from './registration'
import { buildPaymentScene } from './payment'
import { BotContext } from './types'
import { log } from '../logger'
import { Status } from '../types'
import { nextSaturdayAt20 } from '../utils/time'
import { DateTime } from 'luxon'

export const buildBot = (repo: SheetsRepo) => {
  const bot = new Telegraf<BotContext>(env.BOT_TOKEN)

  const notifyAdmins = async (text: string, extra?: ReturnType<typeof Markup.inlineKeyboard>) => {
    for (const adminId of env.ADMIN_IDS) {
      try {
        await bot.telegram.sendMessage(adminId, text, extra ? { reply_markup: extra.reply_markup } : undefined)
      } catch (err) {
        log.error('Failed to notify admin', err)
      }
    }
  }

  const registration = buildRegistrationScene(repo)
  const payment = buildPaymentScene(repo, notifyAdmins)

  const stage = new Scenes.Stage<BotContext>([registration, payment])

  bot.use(session())
  bot.use(stage.middleware())

  bot.start(async (ctx) => {
    await ctx.scene.enter('registration')
  })

  bot.command('register', async (ctx) => ctx.scene.enter('registration'))
  bot.command('payment', async (ctx) => ctx.scene.enter('payment'))

  bot.command('trial', async (ctx) => {
    const user = await repo.getUserByTelegramId(ctx.from!.id)
    if (!user) {
      await ctx.reply('Please register first with /start.')
      return
    }

    const nowIso = DateTime.now().toISO()
    if (nowIso && (await repo.hasUpcomingTrial(user.telegramId, nowIso))) {
      await ctx.reply('You already have an upcoming trial booking.')
      return
    }

    const trialAt = nextSaturdayAt20().toISO()
    await repo.appendTrial({
      telegramId: user.telegramId,
      name: user.name,
      phone: user.phone,
      trialAt: trialAt || '',
      status: Status.TRIAL_BOOKED,
      reminder24hSent: false,
      reminder1hSent: false
    })

    await repo.updateUserStatus(user.telegramId, Status.TRIAL_BOOKED)
    await ctx.reply(`Your trial is booked for ${trialAt}. We will remind you 24h and 1h before.`)
  })

  bot.command('admin', async (ctx) => {
    if (!env.ADMIN_IDS.includes(ctx.from!.id)) {
      await ctx.reply('Access denied.')
      return
    }
    await ctx.reply(
      'Admin panel:',
      Markup.inlineKeyboard([
        [Markup.button.callback('New leads', 'admin:leads')],
        [Markup.button.callback('Upcoming trials', 'admin:trials')],
        [Markup.button.callback('Pending payments', 'admin:payments')],
        [Markup.button.callback('Broadcast', 'admin:broadcast')]
      ])
    )
  })

  bot.action('admin:leads', async (ctx) => {
    await ctx.answerCbQuery()
    const leads = await repo.listLeadsByStatus(Status.NEW)
    if (leads.length === 0) {
      await ctx.reply('No new leads.')
      return
    }
    const lines = leads.map((lead) => `${lead.name} | ${lead.phone} | ${lead.goal} | ${lead.level}`)
    await ctx.reply(`New leads:\n${lines.join('\n')}`)
  })

  bot.action('admin:trials', async (ctx) => {
    await ctx.answerCbQuery()
    const trials = await repo.listUpcomingTrials()
    const upcoming = trials.filter((trial) => DateTime.fromISO(trial.trialAt).toMillis() >= Date.now())
    if (upcoming.length === 0) {
      await ctx.reply('No upcoming trials.')
      return
    }
    const lines = upcoming.map((trial) => `${trial.name} | ${trial.phone} | ${trial.trialAt}`)
    await ctx.reply(`Upcoming trials:\n${lines.join('\n')}`)
  })

  bot.action('admin:payments', async (ctx) => {
    await ctx.answerCbQuery()
    const pending = await repo.listPendingPayments()
    if (pending.length === 0) {
      await ctx.reply('No pending payments.')
      return
    }
    for (const item of pending) {
      await ctx.reply(
        `Pending payment: ${item.name} (${item.phone}) ID: ${item.paymentId}`,
        Markup.inlineKeyboard([
          [Markup.button.callback('Approve', `pay:approve:${item.paymentId}`)],
          [Markup.button.callback('Reject', `pay:reject:${item.paymentId}`)]
        ])
      )
    }
  })

  bot.action('admin:broadcast', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.reply(
      'Choose a status to broadcast to:',
      Markup.inlineKeyboard([
        [Markup.button.callback('NEW', 'broadcast:NEW')],
        [Markup.button.callback('TRIAL_BOOKED', 'broadcast:TRIAL_BOOKED')],
        [Markup.button.callback('TRIAL_DONE', 'broadcast:TRIAL_DONE')],
        [Markup.button.callback('PAYMENT_SENT', 'broadcast:PAYMENT_SENT')],
        [Markup.button.callback('PAID_VERIFIED', 'broadcast:PAID_VERIFIED')],
        [Markup.button.callback('ACTIVE', 'broadcast:ACTIVE')],
        [Markup.button.callback('INACTIVE', 'broadcast:INACTIVE')]
      ])
    )
  })

  bot.action(/^broadcast:(.+)/, async (ctx) => {
    if (!ctx.session.broadcast) ctx.session.broadcast = {}
    ctx.session.broadcast.status = ctx.match[1]
    await ctx.answerCbQuery()
    await ctx.reply('Send the message you want to broadcast.')
  })

  bot.on('text', async (ctx, next) => {
    if (!ctx.session.broadcast?.status) return next()
    const status = ctx.session.broadcast.status as Status
    const message = ctx.message.text
    const users = await repo.listUsersByStatus(status)

    let sent = 0
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(Number(user.telegramId), message)
        sent++
      } catch (err) {
        log.warn('Broadcast failed', err)
      }
    }

    await ctx.reply(`Broadcast done. Sent to ${sent} users.`)
    ctx.session.broadcast = undefined
  })

  bot.action(/^pay:(approve|reject):(.+)/, async (ctx) => {
    if (!env.ADMIN_IDS.includes(ctx.from!.id)) {
      await ctx.answerCbQuery('Not allowed')
      return
    }
    const action = ctx.match[1]
    const paymentId = ctx.match[2]
    await ctx.answerCbQuery()

    const payment = await repo.getPaymentById(paymentId)
    if (!payment) {
      await ctx.reply(`Payment ${paymentId} not found.`)
      return
    }

    await repo.updatePaymentStatus(paymentId, action === 'approve' ? 'APPROVED' : 'REJECTED', ctx.from!.id)

    const status = action === 'approve' ? Status.ACTIVE : Status.INACTIVE
    await repo.updateUserStatus(payment.telegramId, status)

    await ctx.reply(`Payment ${paymentId} ${action.toUpperCase()}. User status set to ${status}.`)
  })

  bot.on('chat_join_request', async (ctx) => {
    const userId = ctx.chatJoinRequest.from.id
    const user = await repo.getUserByTelegramId(userId)
    if (user?.status === Status.ACTIVE) {
      await ctx.approveChatJoinRequest(userId)
      return
    }
    await ctx.declineChatJoinRequest(userId)
  })

  bot.catch((err, ctx) => {
    log.error(`Bot error for update ${ctx.update.update_id}`, err)
  })

  return bot
}
