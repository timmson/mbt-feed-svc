const request = require("request");
const xml2js = require("xml2js").parseString;

function getEventURL(prefix, date) {
    return encodeURI(prefix + (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear() + "/");
}

function isToday(item, date) {
    return item["day"].indexOf(date.getDate()) === 0;
}

function newsApi(url, date) {
    return new Promise((resolve, reject) => {
        request(url, (err, response, body) => {
            if (err) {
                reject(err);
                return;
            }
            xml2js(body, (err, result) => {
                err ? reject(err) : resolve([
                    {
                        title: result.rss.channel[0].item.map((event) => {
                            return {
                                day: event["title"][0].split("-")[0].trim(),
                                title: event["title"][0].split("-")[1].trim(),
                                description: event["description"][0].replace(/(\r\n|\n|\r)/gm, "")
                            }
                        }).filter((item) => isToday(item, date)).reduce((previousValue, currentValue, i) => {
                            return previousValue + "\n\n" + (i === 0 ? "Поводы 🍻 именно сегодня, <i>" +
                                currentValue["day"] + "</i>\n\n" : "") + "<b>" + currentValue["title"] + "</b> - " +
                                currentValue["description"];
                        }, ""),
                        published: date.toString(),
                        link: getEventURL("http://www.calend.ru/day/", date)
                    }
                ]);
            });
        });
    });
}

module.exports = newsApi;
