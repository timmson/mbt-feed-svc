const MoexAPI = require("moex-api");
const YahooAPI = require("yahoo-stock-prices");

const Stock = require("../lib/stock");
const stock = new Stock(new MoexAPI(), YahooAPI);

function stockAPI() {
	return stock.getMessage();
}

module.exports = stockAPI;