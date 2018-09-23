const log = require('log4js').getLogger('news');
const feedReader = require('feed-read');
const request = require("request");
const xml2js = require('xml2js').parseString;
const md5 = require('md5');
const Mongo = require('mongodb');

let news = {
    'demo': getDemoNews,
    'holidays': getTodayHolidays
};

function NewsApi(mongoUrl) {
    this.mongoUrl = mongoUrl;
}

NewsApi.prototype.notifyAboutNews = function (topic, notify) {
    this.connect().then(
        db =>
            this.getFeeds(topic).then(
                feeds =>
                    feeds.slice(0, topic.limit).reverse().forEach((feed, idx, arr) => {
                        this.notifyAboutFeed(db, feed, topic, notify).then(() => (idx === arr.length - 1) ? db.close() : 0).catch(err => log.error(err));
                    })
            ).catch(err => log.error(err))
    ).catch(err => log.error(err));
};

NewsApi.prototype.notifyAboutFeed = function (db, feed, topic, notify) {
    return new Promise((resolve, reject) => {
        const urlHash = md5(feed.link);
        this.findNewsInCache(db, {id: urlHash}).then(
            newsCache => {
                if (!newsCache.id) {
                    this.addNewsToCache(db, {id: urlHash, published: new Date().toString()}).catch(err => reject(err));
                    notify({
                        to: {
                            id: topic.channel,
                            username: topic.channel
                        },
                        version: 2,
                        type: feed.image_url ? 'image_link' : 'link',
                        text: feed.title,
                        image: feed.image_url,
                        url: feed.link,
                        isLike: (topic.name === 'demo')
                    });
                }
                resolve();
            }
        ).catch(err => reject(err));
    });
};


NewsApi.prototype.getFeeds = function (topic) {
    if (news.hasOwnProperty(topic.name)) {
        return news[topic.name](topic.url);
    } else {
        return new Promise((resolve, reject) => feedReader(topic.url, (err, feeds) => err ? reject(err) : resolve(feeds)));
    }
};

NewsApi.prototype.addNewsToCache = function (db, newsCache) {
    return new Promise((resolve, reject) => db.collection('news-cache').insertOne(newsCache, (err, res) => err ? reject(err) : resolve(res)));
};

NewsApi.prototype.findNewsInCache = function (db, criteria) {
    return new Promise((resolve, reject) => db.collection('news-cache').findOne(criteria, (err, res) => err ? reject(err) : resolve(!res ? {} : res)));
};

NewsApi.prototype.connect = function () {
    return new Promise((resolve, reject) => Mongo.connect(this.mongoUrl, (err, db) => err ? reject(err) : resolve(db)));
};

module.exports = NewsApi;

function getDemoNews(url) {
    return new Promise((resolve, reject) => feedReader(url, (err, feeds) => {
            if (err) {
                reject(err);
            }
            resolve(feeds.filter(feed => feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)).map(feed => {
                feed.image_url = feed.content.match(/https:\/\/demotivators.to\/media.+\.thumbnail\.jpg/i)[0].replace('.thumbnail', '');
                feed.published = new Date().toString();
                return feed;
            }));
        })
    );
}

function getTodayHolidays(url) {
    return new Promise((resolve, reject) => {
        let today = new Date();
        request(url, (err, response, body) => {
            if (err) reject(err);
            xml2js(body, (err, result) => {
                err ? reject(err) : resolve([
                    {
                        title: result.rss.channel[0].item.map(event => {
                            return {
                                day: event['title'][0].split('-')[0].trim(),
                                title: event['title'][0].split('-')[1].trim(),
                                description: event['description'][0].replace(/(\r\n|\n|\r)/gm, "")
                            }
                        }).filter(item => isToday(item, today)).reduce((previousValue, currentValue, i) => {
                            return previousValue + '\n\n' + (i === 0 ? 'Поводы 🍻 именно сегодня, <i>' +
                                currentValue['day'] + '</i>\n\n' : '') + '<b>' + currentValue['title'] + '</b> - ' +
                                currentValue['description'];
                        }, ''),
                        published: today.toString(),
                        link: getEventURL('http://www.calend.ru/day/', today)
                    }
                ]);
            })
        });
    });
}

function getEventURL(prefix, date) {
    return encodeURI(prefix + (date.getMonth() + 1) + '-' + date.getDate() + '-' + date.getFullYear() + '/');
}

function isToday(item, date) {
    return item['day'].indexOf(date.getDate()) === 0;
}
