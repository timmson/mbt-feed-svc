const expect = require("chai").expect;
const nock = require("nock");
const fs = require("fs");
const path = require("path");
const WeatherApi = require("../modules/weather-api");

const weatherUrl = {
    site: "http://weather.service.msn.com",
    path: "/find.aspx?src=outlook&weadegreetype=C&culture=RU&weasearchstr=Moscow%2C%20Russia",
    file: "weather.xml"
};

describe("WeatherApi", () => {
    describe("#getWeather", () => {

        beforeEach(() => {
            nock(weatherUrl.site).get(weatherUrl.path).reply(200, fs.readFileSync(path.join(__dirname, weatherUrl.file)));
        });

        it("Should return  not null message", async () => {
            let message = await WeatherApi(new Date(2019, 1, 27));
            //console.log(message);
            expect(message).to.not.be.null;
        });

    });
});
