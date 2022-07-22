const config = require("./config")
const log = require("log4js").getLogger("main")

const Telegraf = require("telegraf")
const ProdCalendar = require("prod-cal")

const weatherApi = require("./modules/weather-api")
const StockApi = require("./modules/stock-api")
const stockApi = new StockApi()
const CronJob = require("cron").CronJob

log.level = "info"
const bot = new Telegraf(config.telegram.token)
const prodCalendar = new ProdCalendar("ru")

const cron = {
	weather: "0 0 7,17 * * *",
	stock: "0 5 10-22/3 * * * "
}

log.info(`Topic Weather started at ${cron.weather}`)
new CronJob({
	cronTime: cron.weather,
	onTick: async () => {
		try {
			let text = await weatherApi(new Date())
			log.info(`${config.to.username} [${config.to.id}] <- ${text}`)
			await bot.telegram.sendMessage(config.to.id, text, {"parse_mode": "HTML"})
		} catch (err) {
			log.error(err)
		}
	},
	start: true
})

log.info(`Topic Stock started at ${cron.stock}`)
new CronJob({
	cronTime: cron.stock,
	onTick: async () => {
		try {
			if (prodCalendar.getCalendar(new Date()) !== "holiday") {
				let text = await stockApi.getMessage()
				log.info(`${config.stockChannel} [${config.stockChannel}] <- ${text}`)
				await bot.telegram.sendMessage(config.stockChannel, text, {"parse_mode": "HTML"})
			} else {
				log.info("Stock - nothing to send")
			}
		} catch (e) {
			log.error(e)
		}
	},
	start: true
})


bot.command("start", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /start`)
	try {
		await ctx.reply("Ok! Now send funny picture to me")
	} catch (err) {
		log.error(err)
	}
})

bot.command("stock", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /stock`)
	try {
		let text = await stockApi.getMessage()
		log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${text}`)
		await bot.telegram.sendMessage(ctx.message.from.id, text, {"parse_mode": "HTML"})
	} catch (err) {
		log.error(err)
	}
})

bot.command("weather", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /weather`)
	try {
		let text = await weatherApi(new Date())
		log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${text}`)
		await bot.telegram.sendMessage(ctx.message.from.id, text, {"parse_mode": "HTML"})
	} catch (err) {
		log.error(err)
	}
})

bot.on("text", async (ctx) => {
	log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${ctx.message.text}`)
	try {
		let text = await stockApi.getPrice(ctx.message.text)
		log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${text}`)
		await bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: ${text}`, {"parse_mode": "HTML"})
	} catch (err) {
		await bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: not found. If you would like to search stocks at MOEX, please add ".me" at the end like "sber.me"`, {"parse_mode": "HTML"})
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
