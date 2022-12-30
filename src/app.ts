import config from "./config"
import log4js from "log4js"
const log = log4js.getLogger("main")
log.level = "info"

import Telegraf from "telegraf"
const bot = new Telegraf(config.telegram.token)

import ProdCalendar from "prod-cal"
const prodCalendar = new ProdCalendar("ru")

import {MoexAPIImpl} from "./stock/moex-api"
import {MarketWatchImpl} from "./stock/market-watch-api"

import {CronJob} from "cron"

import {StockAPIImpl} from "./stock/stock-api"
const stockAPI = new StockAPIImpl(log4js.getLogger("stock"), new MoexAPIImpl(), new MarketWatchImpl())

import StartRoute from "./routes/start-route"
const startRoute = new StartRoute(log)

import StockRoute from "./routes/stock-route"
const stockRoute = new StockRoute(log, bot, stockAPI)

import ScheduleStockRoute from "./routes/schedule-stock-route"
const scheduleStockRoute = new ScheduleStockRoute(log, bot, stockAPI, prodCalendar, config)

import TextRoute from "./routes/text-route"
const textRoute = new TextRoute(log, bot, stockAPI)

const cron = {
	stock: "0 5 10,17 * * * "
}

log.info(`Topic Stock started at ${cron.stock}`)
new CronJob({
	cronTime: cron.stock,
	onTick: () => scheduleStockRoute.handle(),
	start: true
})

bot.command("start", (ctx) => startRoute.handle(ctx))
bot.command("stock", (ctx) => stockRoute.handle(ctx))
bot.on("text", (ctx) => textRoute.handle(ctx))

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
