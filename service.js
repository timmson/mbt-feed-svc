const config = require('./config.js');
const netWatcher = require('./net-watcher.js');
const newsWatcher = require('./news-watcher.js');

const CronJob = require('cron').CronJob;
const log = require('log4js').getLogger('net-service');

log.info("Service started");

new CronJob({cronTime: config.cron, onTick: netWatcher.getNetworkState, start: true});


/**
 * Temp block
 */
let topics = [
    {
        name: 'demo',
        channel: '@tmsnDemotivators',
        url: "http://demotivators.to/feeds/recent/",
        cronTime: '0 * * * * *',
        limit: 10
    }
    /*{name: 'cars', channel: '@tmsnDemotivators', url: "https://auto.mail.ru/rss/"}
     {name: 'gadgets', channel: '@tmsnDemotivators', url: "http://4pda.ru/feed/"}
     {name: 'movies', channel: '@tmsnDemotivators', url: "http://kinozal.me/rss.xml"}
     {name: 'linux', channel: '@tmsnDemotivators', url: "http://www.linux.org.ru/section-rss.jsp?section=1"}
     {name: 'devLife', channel: '@tmsnDemotivators', url: "http://developerslife.ru/rss.xml"}*/
];

topics.forEach(topic =>
    new CronJob(
        {
            cronTime: topic.cronTime,
            onTick: () => {
                newsWatcher.getFeed(topic);
            },
            start: true
        }
    ));