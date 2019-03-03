const weather = require("weather-js");
const ProdCalendar = require("prod-cal");
const prodCalendar = new ProdCalendar("ru");

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const dayTypes = {
    "work": "рабочий день",
    "work_reduced": "сокращенный рабочий день",
    "holiday": "праздник"
};

function formatDate(date) {
    let dayType = prodCalendar.getDay(date.getYear(), date.getMonth + 1, date.getDate());
    return [date.getDate(), months[date.getMonth()] + ",", dayTypes[dayType]].join(" ");
}

function getTomorrow(date) {
    let d = new Date();
    Object.assign(d, date);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
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
                        ["🌡 Температура", currentRecord.temperature, "(ощущается как", currentRecord.feelslike + "),", currentRecord.skytext].join(" "),
                        ["💧 Влажность", currentRecord.humidity + "%"].join(" "),
                        ["🌬 Ветер", currentRecord.winddisplay, ""].join(" "),
                        "",
                        "<b>Завтра, " + formatDate(new Date(forecastRecord.date)) + "</b>",
                        ["🌡 Температура от", forecastRecord.low, "до", forecastRecord.high + ",", forecastRecord.skytextday].join(" ")
                    ].join("\n")
                );

            }
        });
    });
}

module.exports = weatherApi;