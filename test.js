const request = require('request');
const xml2js = require('xml2js').parseString;

getTodayHolidaysV2('http://www.calend.ru/img/export/calend.rss', (err, message) => err ? console.error(err) : console.log(message));

function getTodayHolidaysV2(url, callback) {
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