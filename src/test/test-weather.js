const Weather = require("../lib/weather");
const {expect} = require("chai");
require("mocha");

class Calendar {

    formatDate(date) {
        return "X";
    }

    getTomorrow(date) {
        return "Y";
    }

}


class WeatherApi {

    find(request, cb) {
        cb(null, [
            {
                current: {},
                forecast: [
                    {
                        date: "Y"
                    }
                ]
            }
        ]);
    }

}

class WeatherFailApi {

    find(request, cb) {
        cb(new Error(""), null);
    }

}

describe("Weather should", () => {

    it("return today and tomorrow forecast", async () => {
        let weather = new Weather(new Calendar(), new WeatherApi());

        let result = await weather.get(new Date(2019, 1, 1));

        expect(result).to.not.be.null;
    });

    it("return today forecast when feelslike is differ from temperature", async () => {
        let weather = new Weather(new Calendar(), null);

        let result = weather.formatForecastForToday({
            temperature: "A",
            feelslike: "B"
        });

        expect(result).to.not.be.null;
    });

    it("fail when weatherApi fails", async () => {
        let weather = new Weather(new Calendar(), new WeatherFailApi());
        try {
            await weather.get(new Date(2019, 1, 1));
            expect(false).to.be.ok;
        } catch (e) {
            expect(true).to.be.ok;
        }
    });
});