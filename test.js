const config = require('./config.js');
const newsWatcher = require('./news-watcher.js');

newsWatcher.getFeed({
    name: 'holidays',
    channel: '168739439',
    url: 'http://www.calend.ru/img/export/calend.rss',
    cronTime: '0 0 10-20 * * *',
    period: 3600000,
    limit: 1
});