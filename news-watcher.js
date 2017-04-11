const config = require('./config.js');
const feedReader = require('feed-read');
const request = require('request');
const xml2js = require('xml2js').parseString;
const md5 = require('md5');

const AMQP = require('amqp');
const Mongo = require('mongodb');
const log = require('log4js').getLogger('news-service');

let news = {
    'demo': getDemoNews,
    'holidays': getTodayHolidays,
    'cars-auto': getAutoNews,
    'cars-motor': getMotorNews
};

module.exports.getFeed = function (topic) {
    let callback = (err, messages) => err ? 0 : messages.slice(0, topic.limit).reverse().forEach(message => postMessage(topic.channel, message));
    news.hasOwnProperty(topic.name) ? news[topic.name](topic.url, callback) : feedReader(topic.url, callback);
};

function getDemoNews(url, callback) {
    feedReader(url, (err, feeds) => {
        callback(err, err ? feeds : feeds.filter(feed => feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)).map(feed => {
            feed.image_url = feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)[0].replace('.thumbnail', '');
            feed.published = new Date().toString();
            return feed;
        }));
    });
}

function getTodayHolidays(url, callback) {
    request(url, {}, (err, response, body) => {
        err ? callback(err, null) : 0;
        xml2js(body, (err, result) => {
            err ? callback(err, null) : callback(err, [
                {
                    title: result.rss.channel[0].item.map(event => {
                        return {
                            day: event['title'][0].split('-')[0].trim(),
                            title: event['title'][0].split('-')[1].trim(),
                            description: event['description'][0].replace(/(\r\n|\n|\r)/gm, "")
                        }
                    }).filter(isToday).reduce((previousValue, currentValue, i) => {
                        return previousValue + '\n\n' + (i == 0 ? 'Поводы 🍻 именно сегодня, <i>' +
                                currentValue['day'] + '</i>\n\n' : '' ) + '<b>' + currentValue['title'] + '</b> - ' +
                            currentValue['description'];
                    }, ''),
                    published: new Date().toString(),
                    link: encodeURI('http://www.calend.ru/?d=' + new Date().toDateString())
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

function isToday(item) {
    return item['day'].indexOf(new Date().getDate()) == 0;
}

function addNewsToCache(newsCache, callback) {
    call((db, callback) => db.collection('news-cache').insertOne(newsCache, callback), callback);
}

function findNewsInCache(criteria, callback) {
    log.info(criteria);
    call((db, callback) => db.collection('news-cache').findOne(criteria, (err, newsCache) => {
        callback(err, !err && !newsCache ? {} : newsCache)
    }), callback);
}

function call(action, callback) {
    callback = (callback ? callback : (err, result) => err ? log.error(err.stack) : 0);
    Mongo.connect('mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.database, (err, db) => {
        err ? callback(err, null) : action(db, callback);
        db.close();
    });

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

    let urlHash = md5(message.url);
    findNewsInCache({id: urlHash}, (err, newsCache) => {
        if (err) {
            log.error(err);
        }

        if (!newsCache.id) {
            log.debug(message.url + "=> " + urlHash);
            //log.debug(JSON.stringify(message));

            addNewsToCache({id: urlHash, published: new Date().toString()}, (err) => err ? log.error(err) : 0);

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
    });

}
