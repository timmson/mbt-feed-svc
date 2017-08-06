const newsWatcher = require('./modules/news-api.js');
newsWatcher.getFeed(
    {
        name: 'demo',
        channel: '168739439',
        url: 'http://demotivators.to/feeds/recent/',
        cronTime: '0 25 10-20 * * *',
        limit: 10
    }
);
