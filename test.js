const newsWatcher = require('./news-watcher.js');
newsWatcher.getFeed(
    {
        name: 'demo',
        channel: '@tmsnInstaMemes',
        url: 'http://demotivators.to/feeds/recent/',
        cronTime: '0 25 10-20 * * *',
        limit: 10
    }
);
