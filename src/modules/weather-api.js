const weather = require("weather-js");
const ProdCalendar = require("prod-cal");
const Calendar = require("../lib/calendar");

let calendar = new Calendar(new ProdCalendar("ru"));

function getTemperature(currentRecord) {
    return currentRecord.temperature + "℃" + ((currentRecord.temperature !== currentRecord.feelslike) ? "(ощущается как " + currentRecord.feelslike + "℃)" : "");
}

function weatherApi(date) {
    return new Promise((resolve, reject) => {
        weather.find({
            search: "Moscow, Russia",
            degreeType: "C",
            lang: "RU"
        }, (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            let currentRecord = result[0]["current"];
            let forecastRecord = result[0]["forecast"].filter((row) => row.date === calendar.getTomorrow(date))[0];

            resolve(["<b>Сегодня, " + calendar.formatDate(date) + "</b>",
                    ["🌡", getTemperature(currentRecord)].join(" "),
                    ["⛅", currentRecord.skytext].join(" "),
                    ["💧 Влажность", currentRecord.humidity + "%"].join(" "),
                    ["🌬 Ветер", currentRecord.winddisplay, ""].join(" "),
                    "",
                    "<b>Завтра, " + calendar.formatDate(new Date(forecastRecord.date)) + "</b>",
                    ["🌡 от", forecastRecord.low + "℃", "до", forecastRecord.high + "℃"].join(" "),
                    ["⛅", forecastRecord.skytextday].join(" ")
                ].join("\n")
            );

        });
    });
}

module.exports = weatherApi;