const config = require('./config.js');
const newsWatcher = require('./news-watcher.js');

newsWatcher.getFeed({
    name: 'demo',
    channel: '168739439',
    url: 'http://demotivators.to/feeds/recent/',
    cronTime: '0 0 10-20 * * *',
    period: 3600000,
    limit: 30
});