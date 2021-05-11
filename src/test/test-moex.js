const Moex = require("../lib/moex");

class MockMoexAPI {
	securityMarketData(ticker) {
		return new Promise(resolve => resolve({
			node: {
				last: {
					"USD000UTSTOM": "75.00",
					"VTBA": "12.00",
					"VTBE": "11.00"
				}[ticker]
			}
		})
		);
	}
}

describe("Moex", () => {

	const moex = new Moex(new MockMoexAPI());

	test("info", () => {
		return moex.getMessage()
			.then((result) => expect(result).toEqual("💰75.00, 🇺🇸12.0000, 🇨🇳11.0000"))
			.catch((e) => expect(e).toBeUndefined());
	});

});