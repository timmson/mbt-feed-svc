const config = require('./config.js');
const feedReader = require('feed-read');

const AMQP = require('amqp');
const log = require('log4js').getLogger('news-service');

let news = {
    demo: getDemoNews,
    movie: getMovieNews
};

module.exports.getFeed = function (topic) {
    let callback = (err, messages) => err ? 0 : messages.slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message.link));
    news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
};

function getDemoNews(url, callback) {
    feedReader(url, (err, feeds) => {
        callback(err, err ? feeds : feeds.map(feed => {
                let imageUrl = feed.content.match(/src=.*\.thumbnail/i)[0];
                feed.link = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
                //feed.pubDate = ?
                return feed;
            }));
    });
}

function getMovieNews(url, callback) {
    feedReader(url, (err, feeds) => callback(err, err ? feeds : feeds.map(feed => {
            feed.link = feed.link.replace('kinozal.tv', 'kinozal.me');
            return feed;
        })));
}

function postMessage(to, text) {
    log.info(to + " <- " + text);
    const message = JSON.stringify({to: {id: to, username: to}, text: text});
    const connection = AMQP.createConnection(config.mq.connection);

    connection.on('error', err => log.error("Error from amqp: " + err.stack));

    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', message, {}, (isSend, err) => err ? log.error(err.stack) : 0)
        );
    });
}