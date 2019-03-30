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

/*log.info("Topic Insta started at " + config.instagram.cronTime);
new CronJob({
    cronTime: config.instagram.cronTime,
    onTick: async () => {
        try {
            let messages = await instaApi.notifyAboutMemes();
            for (let i = 0; i < messages.length; i++) {
                log.info(config.to[0].username + " [" + config.to[0].id + "] <- " + messages[i].image);
                await bot.telegram.sendPhoto(config.to[0].id, messages[i].image, Markup.inlineKeyboard([
                    Markup.callbackButton("✅ Approved", "approved"),
                    Markup.urlButton("🌍️ Open", messages[i].post)
                ]).extra());
            }
        } catch (err) {
            log.error(err);
        }
    },
    start: true
});*/

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

bot.on("callback_query", async (ctx) => {
        try {
            if (ctx.callbackQuery.data === "approved") {
                let fileId = ctx.callbackQuery.message.photo.sort((a, b) => (a.file_size > b.file_size ? 1 : -1)).pop().file_id;
                await bot.telegram.sendPhoto(config.instagram.channel, fileId, getLikeButton(getRandomInt(0, 15)).extra());
                await ctx.answerCbQuery("Posted");
            } else {
                await ctx.editMessageReplyMarkup(getLikeButton(parseInt(ctx.callbackQuery.data)));
            }
        } catch (err) {
            log.error(err);
        }
    }
);

bot.command("start", async (ctx) => {
    log.info(ctx.message.from.username + "[" + ctx.message.from.id + "]" + " <- /start");
    try {
        await ctx.reply("Ok! Now send funny picture to me");
    } catch (err) {
        log.error(err);
    }
});

bot.command("meme", async (ctx) => {
    log.info(ctx.message.from.username + "[" + ctx.message.from.id + "]" + " <- /start");
    try {
        if (config.to[0].id === ctx.message.from.id) {
            let messages = await instaApi.notifyAboutMemes();
            for (let i = 0; i < messages.length; i++) {
                log.info(config.to[0].username + " [" + config.to[0].id + "] <- " + messages[i].image);
                await bot.telegram.sendPhoto(config.to[0].id, messages[i].image, getReviewButton(messages[i].post).extra()
                )
                ;
            }
        } else {
            ctx.reply("Sorry:(")
        }
    } catch (err) {

    }
});

bot.on("photo", async (ctx) => {
    let fileId = ctx.message.photo.sort((a, b) => (a.file_size > b.file_size ? 1 : -1)).pop().file_id;
    ctx.telegram.getFileLink(fileId).then(link =>
        log.info(ctx.message.from.username + " [" + ctx.message.from.id + "]" + " <- " + link)
    );
    try {
        if (config.to[0].id === ctx.message.from.id) {
            await bot.telegram.sendPhoto(config.instagram.channel, fileId, getLikeButton(getRandomInt(0, 15)).extra());
        } else {
            /**TODO
             *
             */
            await bot.telegram.sendPhoto(config.to[0].id, ctx.message.photo[0]["file_id"], getReviewButton("https://t.me/" + ctx.message.from.username).extra);
            await ctx.reply("OK! Admin will review your picture very soon and can be post it to @tmsnInstaMemes");
        }
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

function getReviewButton(url) {
    return Markup.inlineKeyboard([
        Markup.callbackButton("✅ Approved", "approved"),
        Markup.urlButton("🌍️ Open", url)
    ]);
}

function getLikeButton(cnt) {
    return Markup.inlineKeyboard(
        [
            Markup.callbackButton("👍" + cnt, "" + (cnt + 1))
        ]
    );
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}