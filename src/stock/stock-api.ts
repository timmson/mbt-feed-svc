import {MarketWatch, StockAPI} from "../interfaces"

export class StockAPIImpl implements StockAPI {

	private log: any
	private moexApi: any
	private marketWatchApi: MarketWatch
	private times: number
	private readonly maxTried: number
	private readonly timeout: number

	constructor(getLogger: any, moexApi: any, marketWatchApi: MarketWatch, timeout?: number) {
		this.log = getLogger("stock")
		this.moexApi = moexApi
		this.marketWatchApi = marketWatchApi
		this.times = 0
		this.maxTried = 2
		this.timeout = timeout || 2
	}

	getTickerPriceFromMoex(ticker: string, currency?: string): Promise<number> {
		return new Promise(async (resolve, reject) => {
			try {
				this.log.info(`Calling MOEX(${ticker},${currency}) ${this.times + 1} of ${this.maxTried + 1}...`)
				const security = await this.moexApi.securityMarketData(ticker, currency)
				this.times = 0
				this.log.info(`...MOEX(${ticker},${currency}) = ${security.node.last}`)
				resolve(parseFloat(security.node.last))
			} catch (e) {
				this.log.error(e)
				if (this.times < this.maxTried) {
					this.times++
					this.log.error(`Wait ${this.timeout}s until next try...`)
					setTimeout(() => this.getTickerPriceFromMoex(ticker, currency)
						.then((result) => resolve(result), (error) => reject(error)), this.timeout * 1000)
				} else {
					reject(e)
				}
			}
		})
	}

	getMessageFromRuStockExchange(): Promise<string> {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.getTickerPriceFromMoex("USD000UTSTOM"),
				this.getTickerPriceFromMoex("IMOEX")
			]).then((result) => {
				resolve([
					"💰" + result[0].toFixed(2),
					"🇷🇺" + (result[1]).toFixed(2)
				].join(", ")
				)
			}).catch((err) => reject(err))
		}))
	}

	getMessageFromIntStockExchange(): Promise<string> {
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