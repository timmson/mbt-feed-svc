const MoexAPI = require("moex-api")
const MarketWatchAPI = require("../lib/market-watch")

const Stock = require("../lib/stock")
const stock = new Stock(new MoexAPI(), new MarketWatchAPI())

class StockAPI {

	getPrice(ticker) {
		return stock.getTickerPriceFromMarketWatch(ticker)
	}

	getMessage() {
		return stock.getMessage()
	}
}

module.exports = StockAPI