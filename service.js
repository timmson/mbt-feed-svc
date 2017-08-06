const config = require('./config.js');
const log = require('log4js');

const MessageApi = require('./modules/message-api.js');
const NetApi = require('./modules/net-api.js');
const NewsApi = require('./modules/news-api.js');
const WeatherApi = require('./modules/weather-api.js');

const CronJob = require('cron').CronJob;

const messageApi = new MessageApi(config.telegramSvc);
const netApi = new NetApi(config);

log.info('Service started');

log.info('Topic NetworkState started at ' + config.cron);
new CronJob({
    cronTime: config.cron,
    onTick: () => {
        netApi.notifyAboutUnknownHosts((message) => messageApi.sendMessage({to: config.to, type: 'text', version: '2', text: message}).catch(log.error));
    }, start: true
});

/**
 * Move to config
 */
log.info('Topic Weather started at 0 0 20 * 4-10 *');
new CronJob({
    cronTime: '0 0 20 * 4-10 *',
    onTick: () => {
        WeatherApi.notifyAboutWeather((text) => messageApi.sendMessage({to: config.to, type: 'text', version: '2', text: text}).catch(log.error));
    },
    start: true
});

config.topics.forEach(topic => {
    log.info('Topic ' + topic.name + ' started at ' + topic.cronTime);
    new CronJob(
        {
            cronTime: topic.cronTime,
            onTick: () => {
                NewsApi.notify(topic, (message) => messageApi.sendMessage(message).catch(log.error));
            },
            start: true
        }
    );
});