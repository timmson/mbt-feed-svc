const Moex = require("../lib/moex");

class MockMoexAPI {

    securityMarketData(ticker) {
        let price = 0;
        switch (ticker) {
            case "USD000UTSTOM":
                price = "70.00";
                break;

            case "VTBA":
                price = "840.00";
                break;

            case "VTBE":
                price = "770.00";
                break;
        }
        return new Promise((resolve => resolve({node: {last: price}})));
    }

}

describe("Moex", () => {

    const moex = new Moex(new MockMoexAPI());

    test("info", () => {
        return moex.getMessage()
            .then((result) => expect(result).toEqual("💰70.00, 🇺🇸12.00, 🇨🇳11.00"))
            .catch((e) => expect(e).toBeUndefined());
    });

});