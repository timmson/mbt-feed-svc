const expect = require("chai").expect;
const WeatherApi = require("../modules/weather-api");

describe("WeatherApi", () => {
    describe("#getWeather", () => {

        it("Should return  not null message", async () => {
            let message = await WeatherApi(new Date());
            //console.log(message);
            expect(message).to.not.be.null;
        });

    });
});
