const log = require("log4js").getLogger("stock")
log.level = "info"

class StockAPI {

	constructor(moexApi, marketWatchApi, timeout) {
		this.moexApi = moexApi
		this.marketWatchApi = marketWatchApi
		this.times = 0
		this.maxTried = 2
		this.timeout = timeout || 2
	}

	getTickerPriceFromMoex(ticker, currency) {
		return new Promise(async (resolve, reject) => {
			try {
				log.info(`Calling MOEX(${ticker},${currency}) ${this.times + 1} of ${this.maxTried + 1}...`)
				let security = await this.moexApi.securityMarketData(ticker, currency)
				this.times = 0
				log.info(`...MOEX(${ticker},${currency}) = ${security.node.last}`)
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

	getMessageFromRuStockExchange() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPriceFromMoex("USD000UTSTOM"),
				this.getTickerPriceFromMoex("IMOEX"),
				this.getTickerPriceFromMoex("MREDC")
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇷🇺" + (result[1]).toFixed(2),
					"🏡" + (result[2]/1000.00).toFixed(1) + "00K",
				].join(", ")
				)
			}).catch((err) => reject(err))
		}))
	}

	getMessageFromIntStockExchange() {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.marketWatchApi.getIndexPrice("spx"),
				this.marketWatchApi.getIndexPrice("shcomp?countrycode=cn")
			]).then((result) => {
				resolve([
					"🇺🇸" + (result[0]).toFixed(2),
					"🇨🇳" + (result[1]).toFixed(2),
				].join(", ")
				)
			}).catch((err) => reject(err))
		}))
	}
}

module.exports = StockAPI