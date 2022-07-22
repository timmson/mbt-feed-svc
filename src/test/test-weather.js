const Weather = require("../lib/weather")

class Calendar {

	formatDate() {
		return "X"
	}

	getTomorrow() {
		return "Y"
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
		])
	}

}

class WeatherFailApi {

	find(request, cb) {
		cb(new Error(""), null)
	}

}

describe("Weather should", () => {

	test("return today and tomorrow forecast", async () => {
		let weather = new Weather(new Calendar(), new WeatherApi())

		let result = await weather.get(new Date(2019, 1, 1))

		expect(result).not.toBeNull()
	})

	test("return today forecast when feelslike is differ from temperature", async () => {
		let weather = new Weather(new Calendar(), null)

		let result = weather.formatForecastForToday({
			temperature: "A",
			feelslike: "B"
		})

		expect(result).not.toBeNull()
	})

	test("fail when weatherApi fails", async () => {
		let weather = new Weather(new Calendar(), new WeatherFailApi())
		try {
			await weather.get(new Date(2019, 1, 1))
			expect(false).toBeTruthy()
		} catch (e) {
			expect(true).toBeTruthy()
		}
	})
})