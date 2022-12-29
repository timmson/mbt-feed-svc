import config from "./config"
import log4js from "log4js"

const log = log4js.getLogger("main")

import Telegraf from "telegraf"
import ProdCalendar from "prod-cal"

import MoexAPI from "moex-api"
import {MarketWatchImpl} from "./market-watch"

import Calendar from "prod-cal"
import {CronJob} from "cron"

import StockAPI from "./stock-api"

const stockAPI = new StockAPI(new MoexAPI(), new MarketWatchImpl())

log.level = "info"
const bot = new Telegraf(config.telegram.token)
const prodCalendar = new ProdCalendar("ru")

const cron = {
	stock: "0 5 10,17 * * * "
}

log.info(`Topic Stock started at ${cron.stock}`)
new CronJob({
	cronTime: cron.stock,
	onTick: async () => {
		try {
			if (prodCalendar.getDate(new Date()) !== Calendar.DAY_HOLIDAY) {
				await sendStockMessage({id: config.stockChannel, name: config.stockChannel})
			} else {
				log.info("Stock - nothing to send")
			}
		} catch (e) {
			log.error(e)
		}
	},
	start: true
})

const sendStockMessage = async ({id, name}) => {
	const messageFromRuSE = await stockAPI.getMessageFromRuStockExchange()
	log.info(`${id} [${name}] <- ${messageFromRuSE}`)
	await bot.telegram.sendMessage(id, messageFromRuSE, {"parse_mode": "HTML"})

	const messageFromIntSE = await stockAPI.getMessageFromIntStockExchange()
	log.info(`${id} [${name}] <- ${messageFromIntSE}`)
	await bot.telegram.sendMessage(id, messageFromIntSE, {"parse_mode": "HTML"})
}


bot.command("start", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /start`)
	try {
		await ctx.reply("Ok!")
	} catch (err) {
		log.error(err)
	}
})

bot.command("stock", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /stock`)
	try {
		await sendStockMessage({id: ctx.message.from.id, name: ctx.message.from.username})
	} catch (err) {
		log.error(err)
	}
})

bot.on("text", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${ctx.message.text}`)
	try {
		const priceFromRuSE = await stockAPI.getTickerPriceFromMoex(ctx.message.text)
		log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${priceFromRuSE}`)
		await bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: ${priceFromRuSE}`, {"parse_mode": "HTML"})
	} catch (err) {
		await bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: not found.`, {"parse_mode": "HTML"})
		log.error(err)
	}
})

bot.startPolling()
bot.telegram.sendMessage(config.to.id, "Started at " + new Date()).catch((err) => log.error(err))

log.info("Service has started")
log.info("Please press [CTRL + C] to stop")

process.on("SIGINT", () => {
	log.info("Service has stopped")
	process.exit(0)
})

process.on("SIGTERM", () => {
	log.info("Service has stopped")
	process.exit(0)
})
