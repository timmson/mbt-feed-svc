const config = require('./config.js');
const newsWatcher = require('./news-watcher.js');

newsWatcher.getFeed({
    name: 'cars-auto',
    channel: '168739439',
    url: 'https://auto.mail.ru/rss/',
    cronTime: '0 0 10-20 * * *',
    period: 3600000,
    limit: 10
});
