const config = require("./config.js");
const log = require("log4js").getLogger("main");

log.level = "info";

const Telegraf = require("telegraf");

const weatherApi = require("./modules/weather-api.js");

const CronJob = require("cron").CronJob;

const bot = new Telegraf(config.telegram.token);

log.info("Topic Weather started at " + config.cron.weather);
new CronJob({
	cronTime: config.cron.weather,
	onTick: async () => {
		try {
			let text = await weatherApi(new Date());
			for (const to of config.to) {
				try {
					log.info(to.username + " [" + to.id + "]" + " <- " + text);
					await bot.telegram.sendMessage(to.id, text, {"parse_mode": "HTML"});
				} catch (e) {
					log.error(e);
				}
			}
		} catch (err) {
			log.error(err);
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

bot.startPolling();
bot.telegram.sendMessage(config.to[0].id, "Started at " + new Date()).catch((err) => log.error(err));

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
