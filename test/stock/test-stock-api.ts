import {MarketWatchAPI, MoexAPI} from "../../src/interfaces"
import {StockAPIImpl} from "../../src/stock/stock-api"

class MockMoexAPI implements MoexAPI{

	getIndexPrice(): Promise<number> {
		return Promise.resolve(3489.00)
	}

	getUSDPrice(): Promise<number> {
		return Promise.resolve(75.00)
	}
}

class MockMarketWatch implements MarketWatchAPI {
	getIndexPrice(ticker): Promise<number> {
		return Promise.resolve({"spx": 3488, "shcomp?countrycode=cn": 3675.02}[ticker])
	}
}

const getLogger = () => ({
	info: () => {return},
	error: () => {return}
})

describe("Stock should", () => {

	const stock = new StockAPIImpl(getLogger, new MockMoexAPI(), new MockMarketWatch(), 0.1)

	test("return message from russian stock exchange", () => {
		const expected = "💰75.00, 🇷🇺3489.00"

		return stock.getMessageFromRuStockExchange().then((actual) => expect(actual).toEqual(expected))
	})

	test("return message from russian stock exchange", () => {
		const expected = "🇺🇸3488.00, 🇨🇳3675.02"

		return stock.getMessageFromIntStockExchange().then((actual) => expect(actual).toEqual(expected))
	})

})