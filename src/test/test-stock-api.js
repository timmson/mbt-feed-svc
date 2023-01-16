const Stock = require("../lib/stock-api")

class MockMoexAPI {

	constructor() {
		this.times = 0
	}

	securityMarketData(ticker) {
		return new Promise((resolve, reject) => {
			switch (ticker) {
			case "IMOEX" :
				resolve(
					{
						node: {last: {"IMOEX": "3489.00"}[ticker]}
					}
				)
				break
			case "USD000UTSTOM" :
				if (this.times < 2) {
					this.times++
					reject(new Error("ERR"))
				}
				resolve({
					node: {last: {"USD000UTSTOM": "75.00"}[ticker]}
				})
				break;
			case "MREDC" :
				resolve(
					{
						node: {last: {"MREDC": "251345.99"}[ticker]}
					}
				)
				break;
			}
		})
	}
}

class MockMarketWatchAPI {
	getIndexPrice(ticker) {
		return Promise.resolve({"spx": 3488, "shcomp?countrycode=cn": 3675.02}[ticker])
	}
}

describe("Stock should", () => {

	const stock = new Stock(new MockMoexAPI(), new MockMarketWatchAPI(), 0.1)

	test("return message from russian stock exchange", () => {

		const expected = "💰75.00, 🇷🇺3489.00, 🏡251.300K"

		return stock.getMessageFromRuStockExchange().then((actual) => expect(actual).toEqual(expected))
	})

	test("return message from foreigin stock exchange", () => {

		const expected = "🇺🇸3488.00, 🇨🇳3675.02"

		return stock.getMessageFromIntStockExchange().then((actual) => expect(actual).toEqual(expected))
	})

})