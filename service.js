const config = require('./config.js');
const netWatcher = require('./net-watcher.js');
const newsWatcher = require('./news-watcher.js');

const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger('service');

log.info('Service started');

new CronJob({cronTime: config.cron, onTick: netWatcher.getNetworkState, start: true});

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