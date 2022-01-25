const Stock = require("../lib/stock");

class MockMoexAPI {

	constructor() {
		this.times = 0;
	}

	securityMarketData(ticker) {
		return new Promise((resolve, reject) => {
			if (this.times < 2) {
				this.times++;
				reject(new Error("ERR"));
			}
			resolve({
				node: {last: {"USD000UTSTOM": "75.00"}[ticker]}
			});
		});
	}
}

class MockYahooAPI {
	getCurrentPrice(ticker) {
		return Promise.resolve({"^GSPC": 3488, "000001.SS": 3675.02, "IMOEX.ME": 3489}[ticker]);
	}
}

describe("Stock should", () => {


	test("return message", () => {
		const stock = new Stock(new MockMoexAPI(), new MockYahooAPI(), 0.1);

		const expected = "💰75.00, 🇺🇸3488.00, 🇨🇳3675.02, 🇷🇺3489.00";

		return stock.getMessage().then((actual) => expect(actual).toEqual(expected));
	});

});