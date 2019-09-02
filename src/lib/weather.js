class Weather {

    constructor(calendar, weatherApi) {
        this.calendar = calendar;
        this.weatherApi = weatherApi;
    }

    get(date) {
        return new Promise(async (resolve, reject) => {
                try {
                    let result = await this.callWeatherApi();

                    let currentRecord = result[0]["current"];
                    currentRecord.date = this.calendar.formatDate(date);

                    let forecastRecord = result[0]["forecast"].filter((row) => row.date === this.calendar.getTomorrow(date))[0];
                    forecastRecord.date = this.calendar.formatDate(new Date(forecastRecord.date));

                    resolve(this.formatForecastForToday(currentRecord) + "\n" + this.formatForecastForTomorrow(forecastRecord));
                } catch (e) {
                    reject(e);
                }
            }
        );
    }

    callWeatherApi() {
        let request = {
            search: "Moscow, Russia",
            degreeType: "C",
            lang: "RU"
        };

        return new Promise((resolve, reject) => {
            this.weatherApi.find(request, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            })
        });
    }

    formatForecastForToday(forecast) {
        return [
            ["<b>Сегодня,", forecast.date + "</b>"].join(" "),
            ["🌡", forecast.temperature + "℃", ((forecast.temperature !== forecast.feelslike) ? "(ощущается как " + forecast.feelslike + "℃)" : "")].join(" "),
            ["⛅", forecast.skytext].join(" "),
            ["💧 Влажность", forecast.humidity + "%"].join(" "),
            ["🌬 Ветер", forecast.winddisplay, ""].join(" ")
        ].join("\n");
    }

    formatForecastForTomorrow(forecast) {
        return [
            ["<b>Завтра,", forecast.date + "</b>"].join(" "),
            ["🌡 от", forecast.low + "℃", "до", forecast.high + "℃"].join(" "),
            ["⛅", forecast.skytextday].join(" ")
        ].join("\n")
    }

}

module.exports = Weather;