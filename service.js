const config = require('./config.js');
const netWatcher = require('./net-watcher.js');
const newsWatcher = require('./news-watcher.js');
const weatherWatcher = require('./weather-watcher');
const regard = require('./regard-watcher');

const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger('service');

log.info('Service started');

log.info('Topic NetworkState started at ' + config.cron);
new CronJob({cronTime: config.cron, onTick: netWatcher.getNetworkState, start: true});

/**
 * Move to config
 */
log.info('Topic Weather started at 0 0 20 * 4-10 *');
new CronJob({cronTime: '0 0 20 * 4-10 *', onTick: weatherWatcher.getWeather, start: true});

log.info('Topic Regard started at 0 0 20 * 4-10 *');
new CronJob({cronTime: '0 0 11 * * *', onTick: regard.getActualGPU, start: true});

config.topics.forEach(topic => {
    log.info('Topic ' + topic.name + ' started at ' + topic.cronTime);
    new CronJob(
        {
            cronTime: topic.cronTime,
            onTick: () => {
                newsWatcher.getFeed(topic);
            },
            start: true
        }
    );
});