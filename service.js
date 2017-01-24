const config = require('./config.js');
const main = require('./main.js');

const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger('net-service');

log.info("Service started");

new CronJob({
    cronTime: config.cron,
    onTick: main.getNetworkState(),
    start: true
});