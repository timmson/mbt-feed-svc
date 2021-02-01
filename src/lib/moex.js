class Moex {

	constructor(moexApi) {
		this.moexApi = moexApi;
	}

	getMessage() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPrice("USD000UTSTOM"),
				this.getTickerPrice("VTBA", "USD"),
				this.getTickerPrice("VTBE", "USD"),
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇺🇸" + (result[1]).toFixed(2),
					"🇨🇳" + (result[2]).toFixed(2)
				].join(", ")
				);
			}).catch((err) => reject(err));
		}));
	}

	getTickerPrice(ticker, currency) {
		return new Promise(async (resolve, reject) => {
			try {
				let security = await this.moexApi.securityMarketData(ticker, currency);
				resolve(parseFloat(security.node.last));
			} catch (e) {
				reject(e);
			}
		});
	}
}

module.exports = Moex;