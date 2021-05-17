const Moex = require("../lib/moex");

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

describe("Moex", () => {

	const moex = new Moex(new MockMoexAPI());

	test("info", () => {
		return moex.getMessage()
			.then((result) => expect(result).toEqual("💰75.00, 🇺🇸1.2000 (3488), 🇨🇳1.1000"))
			.catch((e) => expect(e).toBeUndefined());
	});

});