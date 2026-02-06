import { Markup, Scenes } from 'telegraf'
import { BotContext } from './types'
import { isValidPhone, normalizePhone } from '../utils/validators'
import { SheetsRepo } from '../sheets/repo'
import { Status } from '../types'

export const buildRegistrationScene = (repo: SheetsRepo) => {
  return new Scenes.WizardScene<BotContext>(
    'registration',
    async (ctx) => {
      ctx.session.registration = {}
      await ctx.reply('Welcome! What is your full name?')
      return ctx.wizard.next()
    },
    async (ctx) => {
      if (!('text' in ctx.message!)) return
      ctx.session.registration!.name = ctx.message.text.trim()
      await ctx.reply(
        'Please share your phone number.',
        Markup.keyboard([[Markup.button.contactRequest('Share phone')]]).oneTime().resize()
      )
      return ctx.wizard.next()
    },
    async (ctx) => {
      let phone = ''
      if ('contact' in ctx.message!) {
        phone = ctx.message.contact.phone_number
      } else if ('text' in ctx.message!) {
        phone = ctx.message.text.trim()
      }
      if (!isValidPhone(phone)) {
        await ctx.reply('Please enter a valid phone number (digits with optional +).')
        return
      }
      ctx.session.registration!.phone = normalizePhone(phone)
      await ctx.reply('What is your learning goal?')
      return ctx.wizard.next()
    },
    async (ctx) => {
      if (!('text' in ctx.message!)) return
      ctx.session.registration!.goal = ctx.message.text.trim()
      await ctx.reply(
        'Select your current level:',
        Markup.inlineKeyboard([
          [Markup.button.callback('Beginner', 'level:Beginner')],
          [Markup.button.callback('Intermediate', 'level:Intermediate')],
          [Markup.button.callback('Advanced', 'level:Advanced')]
        ])
      )
      return ctx.wizard.next()
    },
    async (ctx) => {
      if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const level = ctx.callbackQuery.data.split(':')[1]
        ctx.session.registration!.level = level
        await ctx.answerCbQuery()
        await ctx.reply(
          'How did you hear about us?',
          Markup.inlineKeyboard([
            [Markup.button.callback('Instagram', 'source:Instagram')],
            [Markup.button.callback('YouTube', 'source:YouTube')],
            [Markup.button.callback('Friend', 'source:Friend')],
            [Markup.button.callback('Other', 'source:Other')]
          ])
        )
        return ctx.wizard.next()
      }
    },
    async (ctx) => {
      if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const source = ctx.callbackQuery.data.split(':')[1]
        ctx.session.registration!.source = source
        await ctx.answerCbQuery()

        const reg = ctx.session.registration!
        const telegramId = ctx.from!.id
        const now = new Date().toISOString()

        await repo.appendLead(
          {
            telegramId,
            username: ctx.from?.username,
            name: reg.name!,
            phone: reg.phone!,
            goal: reg.goal!,
            level: reg.level!,
            source: reg.source!
          },
          Status.NEW
        )

        await repo.upsertUser({
          telegramId,
          username: ctx.from?.username,
          name: reg.name!,
          phone: reg.phone!,
          goal: reg.goal!,
          level: reg.level!,
          source: reg.source!,
          status: Status.NEW,
          createdAt: now,
          updatedAt: now
        })

        await ctx.reply('Thanks! You are registered. Use /trial to book your trial class.')
        ctx.session.registration = undefined
        return ctx.scene.leave()
      }
    }
  )
}
