import { Telegraf, Markup, Scenes, session } from 'telegraf'
import pino from 'pino'
import { loadConfig } from './config'
import {
  createPayment,
  createTrial,
  getLeadByTgId,
  listAllLeads,
  listLeadsByStatus,
  listPendingPayments,
  listUpcomingTrials,
  setLeadStatus,
  setPaymentStatus,
  upsertLead
} from './crm/crm'
import { LeadStatus } from './crm/types'
import { nextSaturdayAt20 } from './utils/time'
import { getValues } from './sheets/helpers'

const logger = pino({ name: 'omotenashi-academy-bot' })
const config = loadConfig()

const menuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('📝 Royxatdan otish', 'menu:register')],
  [Markup.button.callback('📅 Sinov darsga yozilish', 'menu:trial')],
  [Markup.button.callback('💳 Tolov qildim', 'menu:payment')],
  [Markup.button.callback('ℹ Kurs va narx', 'menu:pricing')],
  [Markup.button.callback(' Savol berish', 'menu:question')]
])

const isAdmin = (id: number) => config.ADMIN_IDS.includes(id)

type SessionData = {
  reg?: {
    name?: string
    phone?: string
    goal?: string
    level?: string
    source?: string
  }
  awaitingPayment?: boolean
  broadcast?: {
    status?: LeadStatus | 'ALL'
    message?: string
  }
}

type BotContext = Scenes.WizardContext & { session: SessionData }

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '')
const isValidUzPhone = (value: string) => {
  const normalized = normalizePhone(value)
  if (/^\+?998\d{9}$/.test(normalized)) return true
  if (/^\d{9}$/.test(normalized)) return true
  return false
}

const mainMenu = (ctx: BotContext) => ctx.reply('Salom! Quyidagi menyudan tanlang:', menuKeyboard)

const registrationScene = new Scenes.WizardScene<BotContext>(
  'registration',
  async (ctx) => {
    ctx.session.reg = {}
    await ctx.reply('Ismingizni yozing:')
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return
    ctx.session.reg!.name = ctx.message.text.trim()
    await ctx.reply('Telefon raqamingizni yuboring (masalan, +998901234567):')
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) return
    const input = ctx.message.text.trim()
    if (!isValidUzPhone(input)) {
      await ctx.reply('Raqam noto‘g‘ri. Masalan, +998901234567 shaklida yuboring.')
      return
    }
    ctx.session.reg!.phone = normalizePhone(input)
    await ctx.reply(
      'Maqsadingizni tanlang:',
      Markup.inlineKeyboard([
        [Markup.button.callback('JLPT', 'reg_goal:JLPT')],
        [Markup.button.callback('Sayohat', 'reg_goal:Sayohat')],
        [Markup.button.callback('Ish', 'reg_goal:Ish')],
        [Markup.button.callback('Anime', 'reg_goal:Anime')],
        [Markup.button.callback('Boshqa', 'reg_goal:Boshqa')]
      ])
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return
    const goal = ctx.callbackQuery.data.split(':')[1]
    ctx.session.reg!.goal = goal
    await ctx.answerCbQuery()
    await ctx.reply(
      'Darajangizni tanlang:',
      Markup.inlineKeyboard([
        [Markup.button.callback('0', 'reg_level:0')],
        [Markup.button.callback('Beginner', 'reg_level:Beginner')],
        [Markup.button.callback('N5', 'reg_level:N5')],
        [Markup.button.callback('N4', 'reg_level:N4')],
        [Markup.button.callback('N3+', 'reg_level:N3+')]
      ])
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return
    const level = ctx.callbackQuery.data.split(':')[1]
    ctx.session.reg!.level = level
    await ctx.answerCbQuery()
    await ctx.reply(
      'Bizni qayerdan topdingiz?',
      Markup.inlineKeyboard([
        [Markup.button.callback('Instagram', 'reg_source:Instagram')],
        [Markup.button.callback('Facebook', 'reg_source:Facebook')],
        [Markup.button.callback('Telegram', 'reg_source:Telegram')],
        [Markup.button.callback('Boshqa', 'reg_source:Boshqa')]
      ])
    )
    return ctx.wizard.next()
  },
  async (ctx) => {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return
    const source = ctx.callbackQuery.data.split(':')[1]
    ctx.session.reg!.source = source
    await ctx.answerCbQuery()

    const reg = ctx.session.reg!
    const tgId = ctx.from?.id
    if (!tgId) return ctx.scene.leave()

    const nowIso = new Date().toISOString()
    const existing = await getLeadByTgId(tgId)
    const status: LeadStatus = existing?.status === 'ACTIVE' ? 'ACTIVE' : 'NEW'

    await upsertLead({
      tgId,
      username: ctx.from?.username,
      name: reg.name || '',
      phone: reg.phone || '',
      goal: reg.goal || '',
      level: reg.level || '',
      source: reg.source || '',
      status,
      createdAtIso: existing?.createdAtIso || nowIso,
      lastContactIso: nowIso
    })

    ctx.session.reg = undefined
    await ctx.reply('Rahmat! Maʼlumotlaringiz saqlandi.')
    await mainMenu(ctx)
    return ctx.scene.leave()
  }
)

const getUserUpcomingTrial = async (tgId: number) => {
  const from = new Date().toISOString()
  const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const upcoming = await listUpcomingTrials(from, to)
  return upcoming.find((trial) => trial.tgId === tgId)
}

const userRateLimit = () => {
  const hits = new Map<number, { ts: number; count: number }>()
  const windowMs = 10_000
  const limit = 6

  return async (ctx: Parameters<Telegraf['use']>[0] extends (ctx: infer C, next: infer N) => unknown ? (ctx: C, next: N) => Promise<void> : never) => {
    const userId = ctx.from?.id
    if (!userId) return ctx.next()
    const now = Date.now()
    const entry = hits.get(userId)
    if (!entry || now - entry.ts > windowMs) {
      hits.set(userId, { ts: now, count: 1 })
      return ctx.next()
    }
    entry.count += 1
    if (entry.count > limit) {
      return
    }
    return ctx.next()
  }
}

export const bot = new Telegraf<BotContext>(config.BOT_TOKEN)

const stage = new Scenes.Stage<BotContext>([registrationScene])

bot.use(session())
bot.use(stage.middleware())

bot.use(async (ctx, next) => {
  const tgId = ctx.from?.id
  const user = tgId ? `${tgId}:${ctx.from?.username ?? 'unknown'}` : 'unknown'
  logger.info({ updateId: ctx.update.update_id, tg_id: tgId, user }, 'update')
  return next()
})

bot.use(userRateLimit())

bot.catch((err, ctx) => {
  logger.error({ err, updateId: ctx.update.update_id, tg_id: ctx.from?.id }, 'bot error')
})

bot.start(async (ctx) => {
  await mainMenu(ctx)
})

bot.command('admin', async (ctx) => {
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }
  await ctx.reply(
    'Admin panel:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🧾 Pending payments', 'admin:payments')],
      [Markup.button.callback('📅 Upcoming trials (next 7 days)', 'admin:trials')],
      [Markup.button.callback('📋 New leads (status NEW)', 'admin:leads')],
      [Markup.button.callback('📣 Broadcast', 'admin:broadcast')]
    ])
  )
})

bot.command('admininfo', async (ctx) => {
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const groupId = config.GROUP_ID
  const groupType = typeof groupId
  await ctx.reply(`GROUP_ID: ${groupId} (${groupType})\nBot: ready`)
})

bot.command('healthcheck', async (ctx) => {
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const uptime = Math.round(process.uptime())
  try {
    const headers = await getValues('Leads!1:1')
    const headerCount = headers[0]?.length ?? 0
    await ctx.reply(`Uptime: ${uptime}s\nSheets: OK (Leads headers: ${headerCount})`)
  } catch (err) {
    logger.error({ err }, 'Healthcheck sheets failed')
    await ctx.reply(`Uptime: ${uptime}s\nSheets: ERROR`)
  }
})

bot.command('cancel', async (ctx) => {
  if (ctx.scene?.current) {
    await ctx.scene.leave()
    ctx.session.reg = undefined
    await ctx.reply('Bekor qilindi.')
  }
  if (ctx.session.awaitingPayment) {
    ctx.session.awaitingPayment = false
  }
  if (ctx.session.broadcast) {
    ctx.session.broadcast = undefined
  }
  await mainMenu(ctx)
})

bot.action('menu:register', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.scene.enter('registration')
})

bot.action('menu:trial', async (ctx) => {
  await ctx.answerCbQuery()
  const tgId = ctx.from?.id
  if (!tgId) return

  const existing = await getUserUpcomingTrial(tgId)
  if (existing) {
    await ctx.reply(`Sizda allaqachon sinov darsi bor: ${existing.trialAtIso}.`)
    return
  }

  const trialAt = nextSaturdayAt20()
  const trialAtIso = trialAt.toISO() || new Date().toISOString()
  await createTrial(tgId, trialAtIso)
  await setLeadStatus(tgId, 'TRIAL_BOOKED')

  await ctx.reply(
    `Sinov darsi yozildi!\nSana: ${trialAt.toFormat('yyyy-LL-dd HH:mm')}\nMeet link: ${config.MEET_LINK}`
  )
})

bot.action('menu:pricing', async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply(
    `Kurs narxi: 990 000 som.\nTo‘lov kartasi: ${config.CARD_NUMBER}\nTo‘lovdan so‘ng “💳 Tolov qildim” tugmasini bosing.`
  )
})

bot.action('menu:payment', async (ctx) => {
  await ctx.answerCbQuery()
  ctx.session.awaitingPayment = true
  await ctx.reply(
    `Iltimos, to‘lov chekini yuboring (foto yoki hujjat).\nSumma: 990 000 so‘m\nKarta: ${config.CARD_NUMBER}`
  )
})

bot.on(['photo', 'document'], async (ctx, next) => {
  if (!ctx.session.awaitingPayment) return next()

  const user = await getLeadByTgId(ctx.from!.id)
  if (!user) {
    await ctx.reply('Iltimos, avval ro‘yxatdan o‘ting.')
    ctx.session.awaitingPayment = false
    return
  }

  let fileId = ''
  let proofType: 'photo' | 'document' = 'photo'

  if ('photo' in ctx.message) {
    const photos = ctx.message.photo
    fileId = photos[photos.length - 1].file_id
    proofType = 'photo'
  } else if ('document' in ctx.message) {
    fileId = ctx.message.document.file_id
    proofType = 'document'
  }

  if (!fileId) {
    await ctx.reply('Iltimos, foto yoki hujjat yuboring.')
    return
  }

  const submittedAtIso = await createPayment(ctx.from!.id, 990000, { fileId, type: proofType })
  await setLeadStatus(ctx.from!.id, 'PAYMENT_SENT')
  ctx.session.awaitingPayment = false

  await ctx.reply('Qabul qilindi, admin tekshiradi.')

  const info = `Yangi to‘lov:\n` +
    `Ism: ${user.name}\n` +
    `Telefon: ${user.phone}\n` +
    `Username: ${user.username || '-'}\n` +
    `TG ID: ${user.tgId}\n` +
    `Summa: 990000`

  const buttons = Markup.inlineKeyboard([
    [Markup.button.callback('Approve', `pay:approve:${user.tgId}:${submittedAtIso}`)],
    [Markup.button.callback('Reject', `pay:reject:${user.tgId}:${submittedAtIso}`)]
  ])

  for (const adminId of config.ADMIN_IDS) {
    try {
      await bot.telegram.sendMessage(adminId, info, { reply_markup: buttons.reply_markup })
      if (proofType === 'photo') {
        await bot.telegram.sendPhoto(adminId, fileId)
      } else {
        await bot.telegram.sendDocument(adminId, fileId)
      }
    } catch (err) {
      logger.error({ err, adminId }, 'Failed to notify admin')
    }
  }
})

bot.action('admin:payments', async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const pending = await listPendingPayments()
  if (pending.length === 0) {
    await ctx.reply('Pending to‘lovlar yo‘q.')
    return
  }

  const items = pending.slice(-10)
  for (const payment of items) {
    const buttons = Markup.inlineKeyboard([
      [Markup.button.callback('Approve', `pay:approve:${payment.tgId}:${payment.submittedAtIso}`)],
      [Markup.button.callback('Reject', `pay:reject:${payment.tgId}:${payment.submittedAtIso}`)]
    ])
    await ctx.reply(
      `TG ID: ${payment.tgId}\nSumma: ${payment.amount}\nSubmitted: ${payment.submittedAtIso}`,
      { reply_markup: buttons.reply_markup }
    )
  }
})

bot.action('admin:trials', async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const from = new Date().toISOString()
  const to = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const trials = await listUpcomingTrials(from, to)
  if (trials.length === 0) {
    await ctx.reply('Yaqin 7 kunda sinov darslar yo‘q.')
    return
  }

  const lines = trials.map((trial) => `${trial.tgId} | ${trial.trialAtIso} | ${trial.meetLink}`)
  await ctx.reply(`Upcoming trials:\n${lines.join('\n')}`)
})

bot.action('admin:leads', async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const leads = await listLeadsByStatus('NEW', 10)
  if (leads.length === 0) {
    await ctx.reply('Yangi leadlar yo‘q.')
    return
  }

  const lines = leads.map((lead) => `${lead.name} | ${lead.phone} | ${lead.goal} | ${lead.level}`)
  await ctx.reply(`New leads:\n${lines.join('\n')}`)
})

bot.action('admin:broadcast', async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  ctx.session.broadcast = { status: undefined, message: undefined }
  await ctx.reply(
    'Segmentni tanlang:',
    Markup.inlineKeyboard([
      [Markup.button.callback('NEW', 'broadcast:NEW')],
      [Markup.button.callback('TRIAL_BOOKED', 'broadcast:TRIAL_BOOKED')],
      [Markup.button.callback('PAYMENT_SENT', 'broadcast:PAYMENT_SENT')],
      [Markup.button.callback('ACTIVE', 'broadcast:ACTIVE')],
      [Markup.button.callback('INACTIVE', 'broadcast:INACTIVE')],
      [Markup.button.callback('ALL', 'broadcast:ALL')]
    ])
  )
})

bot.action(/broadcast:(.+)/, async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) return

  const status = ctx.match[1] as LeadStatus | 'ALL'
  if (!ctx.session.broadcast) ctx.session.broadcast = {}
  ctx.session.broadcast.status = status
  await ctx.reply('Xabar matnini yuboring.')
})

bot.on('text', async (ctx, next) => {
  if (!ctx.session.broadcast?.status || ctx.session.broadcast.message) return next()
  if (!ctx.from || !isAdmin(ctx.from.id)) return next()

  ctx.session.broadcast.message = ctx.message.text
  const status = ctx.session.broadcast.status
  await ctx.reply(
    `Tasdiqlaysizmi?\nSegment: ${status}\nXabar:\n${ctx.session.broadcast.message}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('Yes, send', 'broadcast:confirm')],
      [Markup.button.callback('No', 'broadcast:cancel')]
    ])
  )
})

bot.action('broadcast:cancel', async (ctx) => {
  await ctx.answerCbQuery()
  ctx.session.broadcast = undefined
  await ctx.reply('Bekor qilindi.')
})

bot.action('broadcast:confirm', async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const status = ctx.session.broadcast?.status
  const message = ctx.session.broadcast?.message
  if (!status || !message) {
    await ctx.reply('Broadcast ma’lumotlari topilmadi.')
    return
  }

  const leads = status === 'ALL' ? await listAllLeads() : await listLeadsByStatus(status, 10000)
  let sent = 0
  let failed = 0

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  for (const lead of leads) {
    try {
      await bot.telegram.sendMessage(lead.tgId, message)
      sent += 1
    } catch (err) {
      failed += 1
      logger.warn({ err, tgId: lead.tgId }, 'Broadcast send failed')
    }
    await sleep(100)
  }

  ctx.session.broadcast = undefined
  await ctx.reply(`Broadcast yakunlandi. Yuborildi: ${sent}, xatolik: ${failed}.`)
})

bot.action(/pay:(approve|reject):(\d+):(.+)/, async (ctx) => {
  await ctx.answerCbQuery()
  if (!ctx.from || !isAdmin(ctx.from.id)) {
    await ctx.reply('Ruxsat yo‘q.')
    return
  }

  const action = ctx.match[1]
  const tgId = Number(ctx.match[2])
  const submittedAtIso = ctx.match[3]

  if (action === 'approve') {
    await setPaymentStatus(tgId, submittedAtIso, 'PAID_VERIFIED', ctx.from.id)
    await setLeadStatus(tgId, 'ACTIVE')
    await bot.telegram.sendMessage(
      tgId,
      'To‘lov tasdiqlandi. Guruhga qo‘shilish uchun so‘rov yuboring (private group).'
    )
    await ctx.reply('To‘lov tasdiqlandi.')
    return
  }

  await setPaymentStatus(tgId, submittedAtIso, 'REJECTED')
  await bot.telegram.sendMessage(
    tgId,
    'To‘lov tasdiqlanmadi. Iltimos chekni qayta yuboring yoki admin bilan bog‘laning.'
  )
  await ctx.reply('To‘lov rad etildi.')
})

bot.action(/menu:(question)/, async (ctx) => {
  await ctx.answerCbQuery()
  await ctx.reply('Bu bo‘lim tez orada ishga tushadi.')
})

bot.on('chat_join_request', async (ctx) => {
  const request = ctx.chatJoinRequest
  const groupId = config.GROUP_ID
  const chatId = request.chat.id

  if (String(chatId) !== String(groupId)) {
    return
  }

  const lead = await getLeadByTgId(request.from.id)
  if (lead?.status === 'ACTIVE') {
    await ctx.approveChatJoinRequest(request.from.id)
    return
  }

  await ctx.declineChatJoinRequest(request.from.id)
  await bot.telegram.sendMessage(
    request.from.id,
    'Guruhga qo‘shilish uchun avval to‘lovni yakunlang. “💳 Tolov qildim” tugmasi orqali chek yuboring.'
  )
})
