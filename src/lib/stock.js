class Stock {

	constructor(moexApi, yahooApi) {
		this.moexApi = moexApi;
		this.yahooApi = yahooApi;
	}

	getMessage() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPriceFromMoex("USD000UTSTOM"),
				this.getTickerPriceFromYahoo("^GSPC"),
				this.getTickerPriceFromYahoo("000001.SS"),
				this.getTickerPriceFromYahoo("IMOEX.ME")
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇺🇸" + (result[1]).toFixed(2),
					"🇨🇳" + (result[2]).toFixed(2),
					"🇷🇺" + (result[3]).toFixed(2),
				].join(", ")
				);
			}).catch((err) => reject(err));
		}));
	}

	getTickerPriceFromMoex(ticker, currency) {
		return new Promise(async (resolve, reject) => {
			try {
				let security = await this.moexApi.securityMarketData(ticker, currency);
				resolve(parseFloat(security.node.last));
			} catch (e) {
				reject(e);
			}
		});
	}

	getTickerPriceFromYahoo(ticker) {
		return new Promise(async (resolve, reject) => {
			try {
				let securityPrice = await this.yahooApi.getCurrentPrice(ticker);
				resolve(parseFloat(securityPrice));
			} catch (e) {
				reject(e);
			}
		});
	}
}

module.exports = Stock;