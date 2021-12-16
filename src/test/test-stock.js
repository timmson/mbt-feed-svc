const Moex = require("../lib/stock");

class MockMoexAPI {
	securityMarketData(ticker) {
		return new Promise(resolve => resolve({
			node: {
				last: {
					"USD000UTSTOM": "75.00"
				}[ticker]
			}
		})
		);
	}
}

class MockYahooAPI {
	getCurrentPrice(ticker) {
		return Promise.resolve({"^GSPC": 3488, "000001.SS": 3675.02, "IMOEX.ME": 3489}[ticker]);
	}
}

describe("Moex and Yahoo", () => {

	const moex = new Moex(new MockMoexAPI(), new MockYahooAPI());

	test("info", () => {
		return moex.getMessage()
			.then((result) => expect(result).toEqual("💰75.00, 🇺🇸3488.00, 🇨🇳3675.02, 🇷🇺3489.00"))
			.catch((e) => expect(e).toBeUndefined());
	});

});