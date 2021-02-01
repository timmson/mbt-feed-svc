const Moex = require("../lib/moex");

class MockMoexAPI {

    securityMarketData(ticker, currency) {
        let price = 0;
        switch (ticker) {
            case "USD000UTSTOM":
                price = "75.00";
                break;

            case "VTBA":
                if (currency !== undefined) {
                    price = "12.00";
                }
                break;

            case "VTBE":
                if (currency !== undefined) {
                    price = "11.00";
                }
                break;
        }
        return new Promise((resolve => resolve({node: {last: price}})));
    }

}

describe("Moex", () => {

    const moex = new Moex(new MockMoexAPI());

    test("info", () => {
        return moex.getMessage()
            .then((result) => expect(result).toEqual("💰75.00, 🇺🇸12.00, 🇨🇳11.00"))
            .catch((e) => expect(e).toBeUndefined());
    });

});