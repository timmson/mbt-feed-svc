//const config = require('./config.js');
const main = require('./news-watcher');

const log = require('log4js').getLogger('net-service');

log.info("Test started");

main.getFeed(
    {
        name: 'cars-auto',
        channel: '@tmsnAutoNews',
        url: 'http://motor.ru/export/atom',
        cronTime: '0 0 12 * * *',
        period: 3600000,
        limit: 10
    });
