const config = require("./config.js");
config.mongo = { url : process.env["db"]};
const log = require("log4js").getLogger();

const MessageApi = require("./modules/message-api.js");
const NetApi = require("./modules/net-api.js");
const NewsApi = require("./modules/news-api.js");
const WeatherApi = require("./modules/weather-api.js");

const CronJob = require("cron").CronJob;

const messageApi = new MessageApi(config.telegramSvc);
const netApi = new NetApi(config);
const newsApi = new NewsApi(config.mongo.url);

log.info("Service started");

log.info("Topic NetworkState started at " + config.cron.network);
new CronJob({
    cronTime: config.cron.network,
    onTick: () => netApi.notifyAboutUnknownHosts(text => messageApi.sendMessage({to: config.to, type: "text", version: "2", text: text}).catch(err => log.error(err))),
    start: true
});

/**
 * Move to config
 */
log.info("Topic Weather started at " + config.cron.weather);
new CronJob({
    cronTime: config.cron.weather,
    onTick: () => WeatherApi.notifyAboutWeather(text => messageApi.sendMessage({to: config.to, type: "text", version: "2", text: text}).catch(err => log.error(err))),
    start: true
});

config.topics.forEach(topic => {
    log.info("Topic " + topic.name + " started at " + topic.cronTime);
    new CronJob(
        {
            cronTime: topic.cronTime,
            onTick: () => newsApi.notifyAboutNews(topic, message => messageApi.sendMessage(message).catch(err => log.error(err))),
            start: true
        }
    );
});