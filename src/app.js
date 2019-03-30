const config = require("./config.js");
const log = require("log4js").getLogger("main");

log.level = "info";

const Telegraf = require("telegraf");
const Markup = require("telegraf/markup");

const newsApi = require("./modules/news-api.js");
const weatherApi = require("./modules/weather-api.js");
const InstaApi = require("./modules/insta-api.js");

const CronJob = require("cron").CronJob;

const bot = new Telegraf(config.telegram.token);
const instaApi = new InstaApi(config.instagram);


log.info("Topic Weather started at " + config.cron.weather);
new CronJob({
    cronTime: config.cron.weather,
    onTick: async () => {
        try {
            let text = await weatherApi(new Date());
            config.to.forEach(async to => {
                    try {
                        log.info(to.username + "[" + to.id + "]" + " <- " + text);
                        await bot.telegram.sendMessage(to.id, text);
                    } catch (e) {
                        log.error(e);
                    }
                }
            );
        } catch (err) {
            log.error(err);
        }
    },
    start: true
});

log.info("Topic Insta started at " + config.instagram.cronTime);
new CronJob({
    cronTime: config.instagram.cronTime,
    onTick: async () => {
        try {
            let messages = await instaApi.notifyAboutMemes();
            for (let i = 0; i < messages.length; i++) {
                log.info("channel: " + message.to.id + " <- " + message.url);
                await bot.telegram.sendMessage(message[i].to.id, message[i].text, getLikeButton(getRandomInt(0, 15)));
            }
        } catch (err) {
            log.error(err);
        }
    },
    start: true
});

config.topics.forEach(topic => {
    log.info("Topic " + topic.name + " started at " + topic.cronTime);
    new CronJob(
        {
            cronTime: topic.cronTime,
            onTick: async () => {
                try {
                    let messages = await newsApi(topic.url, new Date());
                    messages.forEach(async message => {
                            try {
                                log.info("channel: " + topic.channel + " <- " + message.title);
                                await bot.telegram.sendMessage(topic.channel, text, Markup.inlineKeyboard([
                                    Markup.urlButton("🌍️ Open", message.link),
                                ]).extra());

                            } catch (err) {
                                log.error(err);
                            }
                        }
                    )
                } catch (err) {
                    log.error(err);
                }
            },
            start: true
        }
    );
});

bot.on("callback_query", ctx =>
    ctx.editMessageReplyMarkup(getLikeButton(parseInt(message.data))).catch(log.error)
);

bot.on("photo", ctx => {
    log.info("channel: " + config.instagram.channel + " <- " + "...");
    log.info(ctx);
    //await bot.telegram.sendMessage(ctx.to.id, message[i].text, getLikeButton(getRandomInt(0, 15)));
});

bot.startPolling();
bot.telegram.sendMessage(config.to[0].id, "Started at " + new Date()).catch(log.error);

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

function getLikeButton(cnt) {
    return Markup.inlineKeyboard(
        [
            Markup.callbackButton("👍" + cnt, "" + (cnt + 1))
        ]
    ).extra();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}