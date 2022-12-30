import {MarketWatchAPI, MoexAPI, StockAPI} from "../interfaces"

export class StockAPIImpl implements StockAPI {

	private log: any
	private moexAPI: MoexAPI
	private marketWatchAPI: MarketWatchAPI
	private times: number
	private readonly maxTried: number
	private readonly timeout: number

	constructor(log: any, moexAPI: MoexAPI, marketWatchAPI: MarketWatchAPI, timeout?: number) {
		this.log = log
		this.moexAPI = moexAPI
		this.marketWatchAPI = marketWatchAPI
		this.times = 0
		this.maxTried = 2
		this.timeout = timeout || 2
	}

	getMessageFromRuStockExchange(): Promise<string> {
		return new Promise(((resolve, reject) => {
			Promise.all([
				this.moexAPI.getUSDPrice(),
				this.moexAPI.getIndexPrice()
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
				this.marketWatchAPI.getIndexPrice("spx"),
				this.marketWatchAPI.getIndexPrice("shcomp?countrycode=cn")
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