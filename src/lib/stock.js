const log = require("log4js").getLogger("stock")
log.level = "info"

class Stock {

	constructor(moexApi, yahooApi, timeout) {
		this.moexApi = moexApi
		this.yahooApi = yahooApi
		this.times = 0
		this.maxTried = 2
		this.timeout = timeout || 2
	}

	getMessage() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPriceFromMoex("USD000UTSTOM"),
				this.getTickerPriceFromYahoo("^GSPC"),
				this.getTickerPriceFromYahoo("000001.SS"),
				this.getTickerPriceFromMoex("IMOEX")
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇺🇸" + (result[1]).toFixed(2),
					"🇨🇳" + (result[2]).toFixed(2),
					"🇷🇺" + (result[3]).toFixed(2),
				].join(", ")
				)
			}).catch((err) => reject(err))
		}))
	}

	getTickerPriceFromMoex(ticker, currency) {
		return new Promise(async (resolve, reject) => {
			try {
				log.info(`Calling securityMarketData ${this.times + 1} of ${this.maxTried + 1}...`)
				let security = await this.moexApi.securityMarketData(ticker, currency)
				this.times = 0
				log.info("...OK")
				resolve(parseFloat(security.node.last))
			} catch (e) {
				log.error(e)
				if (this.times < this.maxTried) {
					this.times++
					log.error(`Wait ${this.timeout}s until next try...`)
					setTimeout(() => this.getTickerPriceFromMoex(ticker, currency)
						.then((result) => resolve(result), (error) => reject(error)), this.timeout * 1000)
				} else {
					reject(e)
				}
			}
		})
	}

	getTickerPriceFromYahoo(ticker) {
		return new Promise(async (resolve, reject) => {
			try {
				let securityPrice = await this.yahooApi.getCurrentPrice(ticker.toUpperCase())
				resolve(parseFloat(securityPrice))
			} catch (e) {
				reject(e)
			}
		})
	}
}

module.exports = Stock