const weather = require("weather-js");
const ProdCalendar = require("prod-cal");
const prodCalendar = new ProdCalendar("ru");

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const dayTypes = {
    "work": "рабочий день ⚒",
    "work_reduced": "сокращенный рабочий день 🔨",
    "holiday": "выходной 👨‍👩‍👧"
};

function formatDate(date) {
    let dayType = prodCalendar.getDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return [date.getDate(), months[date.getMonth()] + ",", dayTypes[dayType]].join(" ");
}

function getTomorrow(date) {
    let d = new Date();
    Object.assign(d, date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function getTemperature(currentRecord) {
    return currentRecord.temperature+ "℃" + ((currentRecord.temperature !== currentRecord.feelslike) ? "(ощущается как " + currentRecord.feelslike + "℃)" : "");
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
            } else {

                let currentRecord = result[0]["current"];
                let forecastRecord = result[0]["forecast"].filter(row => row.date === getTomorrow(date))[0];

                resolve(["<b>Сегодня, " + formatDate(date) + "</b>",
                        ["🌡", getTemperature(currentRecord)].join(" "),
                        ["⛅", currentRecord.skytext].join(" "),
                        ["💧 Влажность", currentRecord.humidity + "%"].join(" "),
                        ["🌬 Ветер", currentRecord.winddisplay, ""].join(" "),
                        "",
                        "<b>Завтра, " + formatDate(new Date(forecastRecord.date)) + "</b>",
                        ["🌡 от", forecastRecord.low + "℃", "до", forecastRecord.high + "℃"].join(" "),
                        ["⛅", forecastRecord.skytextday].join(" ")
                    ].join("\n")
                );

            }
        });
    });
}

module.exports = weatherApi;