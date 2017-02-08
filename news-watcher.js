const config = require('./config.js');
const feedReader = require('feed-read');
const request = require('request');
const xml2js = require('xml2js').parseString;

const AMQP = require('amqp');
const log = require('log4js').getLogger('news-service');

let news = {
    'demo': this.getDemoNews,
    'cars-auto': this.getAutoNews,
    'cars-motor': this.getMotorNews
};

module.exports = {

    getFeed: function (topic) {
        let callback = (err, messages) => err ? 0 : messages.filter(message => isNew(message, topic.period)).slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message));
        news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
    },

    getDemoNews: function (url, callback) {
        feedReader(url, (err, feeds) => {
            callback(err, err ? feeds : feeds.filter(feed => feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)).map(feed => {
                    feed.image_url = feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)[0].replace('.thumbnail', '');
                    feed.published = new Date().toString();
                    return feed;
                }));
        });
    },

    getAutoNews: function (url, callback) {
        request(url, {}, (err, response, body) => {
            err ? callback(err, null) : 0;
            xml2js(body, (err, result) => {
                err ? callback(err, null) : callback(err, result.rss.channel[0].item.map(entry => ({
                        title: entry['title'][0],
                        link: entry['link'][0],
                        published: entry['pubDate'][0],
                        image_url: entry['enclosure'][0]['$']['url']
                    })));
            });
        });
    },

    getMotorNews: function (url, callback) {
        request(url, {}, (err, response, body) => {
            err ? callback(err, null) : 0;
            xml2js(body, (err, result) => {
                err ? callback(err, null) : callback(err, result.feed.entry.filter(e => e['media:content']).map(entry => ({
                        title: entry['title'][0],
                        link: entry['link'][0]['$']['href'],
                        published: entry['updated'][0],
                        image_url: entry['media:content'][0]['$']['url']
                    })));
            });
        });
    }
};

function isNew(message, period) {
    return (new Date().getTime() - new Date(message.published).getTime()) <= period
}


function postMessage(to, feed) {
    log.info(to + " <- " + feed.title);
    const message = {
        to: {
            id: to,
            username: to
        },
        version: 2,
        type: 'image_link',
        text: feed.title,
        image: feed.image_url,
        url: feed.link,
    };

    log.debug(JSON.stringify(message));

    const connection = AMQP.createConnection(config.mq.connection);
    connection.on('error', err => log.error("Error from amqp: " + err.stack));
    connection.on('ready', () => {
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', JSON.stringify(message), {}, (isSend, err) => err ? log.error(err.stack) : 0)
        );
    });
}