const weatherJS = require("weather-js")
const ProdCalendar = require("prod-cal")
const Calendar = require("../lib/calendar")
const Weather = require("../lib/weather")

let weather = new Weather(new Calendar(new ProdCalendar("ru")), weatherJS)

function weatherApi(date) {
	return weather.get(date)
}

module.exports = weatherApi