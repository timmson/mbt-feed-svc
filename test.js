const config = require('./config.js');
const NewsApi = require('./modules/news-api.js');
const MessageApi = require('./modules/message-api.js');

const messageApi = new MessageApi(config.telegramSvc);
const newsApi = new NewsApi();

newsApi.notifyAboutNews({
    name: 'demo',
    channel: '@tmsnInstaMemes',
    url: 'http://demotivators.to/feeds/recent/',
    cronTime: '0 25 10-20 * * *',
    limit: 10
}, message => messageApi.sendMessage(message).catch(console.error));