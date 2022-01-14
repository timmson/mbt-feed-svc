const MoexAPI = require("moex-api");
const YahooAPI = require("yahoo-stock-prices");

const Stock = require("../lib/stock");
const stock = new Stock(new MoexAPI(), YahooAPI);

class StockAPI {

	getPrice(ticker) {
		return stock.getTickerPriceFromYahoo(ticker);
	}

	getMessage() {
		return stock.getMessage();
	}
}

module.exports = StockAPI;