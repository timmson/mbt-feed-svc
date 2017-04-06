const config = require('./config.js');
const feedReader = require('feed-read');
const request = require('request');
const xml2js = require('xml2js').parseString;

const AMQP = require('amqp');
const log = require('log4js').getLogger('news-service');

let demoCache = {};

let news = {
    'demo': getDemoNews,
    'holidays': getTodayHolidays,
    'cars-auto': getAutoNews,
    'cars-motor': getMotorNews
};

module.exports.getFeed = function (topic) {
    let callback = (err, messages) => err ? 0 : messages.filter(message => isNew(message, topic.period)).slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message));
    news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
};

function getDemoNews(url, callback) {
    feedReader(url, (err, feeds) => {
        callback(err, err ? feeds : feeds.filter(feed => feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)).map(feed => {
            feed.image_url = feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)[0].replace('.thumbnail', '');
            feed.published = getPublishTime(feed.image_url);
            return feed;
        }));
    });
}

/*function getTodayHolidays(url, callback) {
    request(url, {}, (err, response, body) => {
        err ? callback(err, null) : 0;
        xml2js(body, (err, result) => {
            err ? callback(err, null) : callback(err, result.rss.channel[0].item.map(entry => ({
                title: entry['title'][0],
                link: entry['link'][0],
                published: entry['pubDate'][0],
                image_url: imageIdToUrl(entry['link'][0], 'http://www.calend.ru/img/content')
            })));
        });
    });
}*/

function getTodayHolidays(url, callback) {
    request(url, {}, (err, response, body) => {
        err ? callback(err, null) : 0;
        xml2js(body, (err, result) => {
            err ? callback(err, null) : callback(err, [
                {
                    title: result.rss.channel[0].item.reduce((previousValue, currentValue) => previousValue + '\n' + currentValue['title'][0], ''),
                    published: new Date().toString(),
                    link: 'http://www.calend.ru/'
                }
            ]);
        });
    });
}

function getAutoNews(url, callback) {
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
}

function getMotorNews(url, callback) {
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

function isNew(message, period) {
    return (new Date().getTime() - new Date(message.published).getTime()) <= period
}

function getPublishTime(url) {
    if (demoCache[url] == null) {
        demoCache[url] = new Date().toString();
    }
    return demoCache[url];
}

function imageIdToUrl(linkUrl, imageUrlPrefix) {
    let id = linkUrl.match(/\/[0-9]{3,4}\//)[0];
    id = Number.parseInt(id.substring(1, id.length - 1));
    return [imageUrlPrefix, 'i' + Math.floor(id / 1000), id + '.jpg'].join('/');
}

function postMessage(to, feed) {
    log.info(to + " <- " + feed.title);
    const message = {
        to: {
            id: to,
            username: to
        },
        version: 2,
        type: feed.image_url ? 'image_link' : 'link',
        text: feed.title,
        image: feed.image_url,
        url: feed.link,
    };

    log.debug(JSON.stringify(message));

    const connection = AMQP.createConnection(config.mq.connection);
    connection.on('error', err => log.error("Error from amqp: " + err.stack));
    connection.on('ready', () =>
        connection.exchange(config.mq.exchange, {type: 'fanout', durable: true, autoDelete: false}, exchange =>
            exchange.publish('', JSON.stringify(message), {}, (isSend, err) => {
                    err ? log.error(err.stack) : 0;
                    connection.disconnect();
                }
            )
        )
    );
}
