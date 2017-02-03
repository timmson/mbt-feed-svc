const config = require('./config.js');
const feedReader = require('feed-read');
const request = require('request');
const xml2js = require('xml2js').parseString;

const AMQP = require('amqp');
const log = require('log4js').getLogger('news-service');

let news = {
    'demo': getDemoNews,
    'cars-motor': getMotorNews
};

module.exports.getFeed = function (topic) {
    let callback = null;
    if (topic.name === 'demo') {
        callback = (err, messages) => err ? 0 : messages.slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message.link));
    } else {
        callback = (err, messages) => err ? 0 : messages.filter(message => isNew(message, topic.period)).slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message));
    }
    news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
};

function getDemoNews(url, callback) {
    feedReader(url, (err, feeds) => {
        callback(err, err ? feeds : feeds.map(feed => {
                let imageUrl = feed.content.match(/src=.*\.thumbnail/i)[0];
                feed.link = imageUrl.substr(5, imageUrl.length - 15) + '.jpg';
                return feed;
            }));
    });
}

function getMotorNews(url, callback) {
    request(url, {}, (err, response, body) => {
        err ? callback(err, null) : 0;
        xml2js(body, (err, result) => {
            err ? callback(err, null) : callback(err, result.feed.entry.map(entry => ({
                    title: entry['title'][0],
                    link: entry['link'][0]['$']['href'],
                    published: entry['updated'][0],
                    image_url: entry['media:content'][0]['$']['url']
                })));
        });
    });
}

function isNew(message, period) {
    return (new Date().getTime() - new Date(message.published).getTime()) <= period
}


function postMessage(to, feed) {
    log.info(to + " <- " + feed.text);
    const message = {
        to: {
            id: to,
            username: to
        },
        version: 2,
        type: 'link',
        text: feed.title,
        image: feed.image_url,
        url: feed.link,
    };

    if (feed.hasOwnProperty('image_url')) {
        message.image = feed.image_url;
        message.type = 'image_link';
    }

    const connection = AMQP.createConnection(config.mq.connection);
    connection.on('error', err => log.error("Error from amqp: " + err.stack));
    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', JSON.stringify(message), {}, (isSend, err) => err ? log.error(err.stack) : 0)
        );
    });
}