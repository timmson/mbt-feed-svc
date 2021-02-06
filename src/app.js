const config = require("./config");
const log = require("log4js").getLogger("main");

log.level = "info";

const Telegraf = require("telegraf");

const weatherApi = require("./modules/weather-api");
const stockApi = require("./modules/stock-api");
const CronJob = require("cron").CronJob;

const bot = new Telegraf(config.telegram.token);

const cron = {
	weather: "0 0 7,17 * * *",
	stock: "0 0 10-22/2 * * * "
};

log.info(`Topic Weather started at ${cron.weather}`);
new CronJob({
	cronTime: cron.weather,
	onTick: async () => {
		try {
			let text = await weatherApi(new Date());
			log.info(config.to.username + " [" + config.to.id + "]" + " <- " + text);
			await bot.telegram.sendMessage(config.to.id, text, {"parse_mode": "HTML"});
		} catch (err) {
			log.error(err);
		}
	},
	start: true
});

log.info(`Topic Stock started at ${cron.stock}`);
new CronJob({
	cronTime: cron.stock,
	onTick: async () => {
		try {
			let text = await stockApi();
			log.info(config.to.username + " [" + config.to.id + "]" + " <- " + text);
			await bot.telegram.sendMessage(config.to.id, text, {"parse_mode": "HTML"});
		} catch (e) {
			log.error(e);
		}
	},
	start: true
});


bot.command("start", async (ctx) => {
	log.info(ctx.message.from.username + " [" + ctx.message.from.id + "]" + " <- /start");
	try {
		await ctx.reply("Ok! Now send funny picture to me");
	} catch (err) {
		log.error(err);
	}
});

bot.command("stock", async (ctx) => {
	log.info(ctx.message.from.username + " [" + ctx.message.from.id + "]" + " <- /stock");
	try {
		let text = await stockApi();
		log.info(config.to.username + " [" + config.to.id + "]" + " <- " + text);
		await ctx.reply(text);
	} catch (err) {
		log.error(err);
	}
});

bot.command("weather", async (ctx) => {
	log.info(ctx.message.from.username + " [" + ctx.message.from.id + "]" + " <- /weather");
	try {
		let text = await weatherApi(new Date());
		log.info(config.to.username + " [" + config.to.id + "]" + " <- " + text);
		await ctx.reply(text);
	} catch (err) {
		log.error(err);
	}
});

bot.startPolling();
bot.telegram.sendMessage(config.to.id, "Started at " + new Date()).catch((err) => log.error(err));

log.info("Service has started");
log.info("Please press [CTRL + C] to stop");

process.on("SIGINT", () => {
	log.info("Service has stopped");
	process.exit(0);
});

process.on("SIGTERM", () => {
	log.info("Service has stopped");
	process.exit(0);
});
