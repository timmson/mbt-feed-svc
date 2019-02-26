const log = require("log4js").getLogger("weather");
const weather = require("weather-js");


function getTomorrow() {
    let d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

module.exports.notifyAboutWeather = function (notify, isTomorrow) {
    weather.find({
        search: "Moscow, Russia",
        degreeType: "C",
        lang: "RU"
    }, (err, result) => {
        if (err) {
            log.error(err);
        }

        let currentRecord = result[0]["current"];
        let forecastRecord = result[0]["forecast"].filter(row => row.date === getTomorrow())[0];

        notify(["<b>Сегодня<b>",
                ["🌡 Температура", currentRecord.temperature, "(ощущается как", currentRecord.feelslike + "),", currentRecord.skytext].join(" "),
                ["💧 Влажность", currentRecord.humidity + "%"].join(" "),
                ["🌬 Ветер", currentRecord.winddisplay, ""].join(" "),
                "",
                "<b>" + forecastRecord.day + ", " + forecastRecord.date + "</b>",
                ["🌡 Температура от", forecastRecord.low, "до", forecastRecord.high + ",", forecastRecord.skytextday].join(" ")
            ].join("\n")
        );
    });
};
