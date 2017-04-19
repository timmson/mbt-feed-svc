const config = require('./config.js');
const newsWatcher = require('./news-watcher.js');

newsWatcher.getFeed({
    name: 'football',
    channel: '168739439',
    url: 'https://www.championat.com/rss/article/football/russiapl/',
    cronTime: '0 0 10-20 * * *',
    period: 3600000,
    limit: 15
});
