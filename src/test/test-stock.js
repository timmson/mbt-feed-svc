const Moex = require("../lib/stock");

class MockMoexAPI {
	securityMarketData(ticker) {
		return new Promise(resolve => resolve({
			node: {
				last: {
					"USD000UTSTOM": "75.00",
					"VTBA": "1.20",
					"VTBE": "1.10"
				}[ticker]
			}
		})
		);
	}
}

class MockYahooAPI {
	getCurrentPrice(ticker) {
		return Promise.resolve({"^GSPC" : 3488, "IMOEX.ME": 3489}[ticker]);
	}
}

describe("Moex and Yahoo", () => {

	const moex = new Moex(new MockMoexAPI(), new MockYahooAPI());

	test("info", () => {
		return moex.getMessage()
			.then((result) => expect(result).toEqual("💰75.00, 🇺🇸3488.00, 🇨🇳1.1000, 🇷🇺3489.00"))
			.catch((e) => expect(e).toBeUndefined());
	});

});