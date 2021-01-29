class Moex {

	constructor(moexApi) {
		this.moexApi = moexApi;
	}

	getMessage() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPrice("USD000UTSTOM"),
				this.getTickerPrice("VTBA"),
				this.getTickerPrice("VTBE"),
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇺🇸" + (result[1] / result[0]).toFixed(2),
					"🇨🇳" + (result[2] / result[0]).toFixed(2)
				].join(", ")
				);
			}).catch((err) => reject(err));
		}));
	}

	getTickerPrice(ticker) {
		return new Promise(async (resolve, reject) => {
			try {
				let security = await this.moexApi.securityMarketData(ticker);
				resolve(parseFloat(security.node.last));
			} catch (e) {
				reject(e);
			}
		});
	}
}

module.exports = Moex;