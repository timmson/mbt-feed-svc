const cheerio = require("cheerio")
const fetch = require("node-fetch")
const log = require("log4js").getLogger("market-watch")
log.level = "info"

const baseUrl = "https://www.marketwatch.com/investing/index/"

class MarketWatch {

	async getStockPrice(ticket) {
		try {
			const url = `${baseUrl + ticket}`
			log.info(`Fetching ${url}`)
			const resp = await fetch(url)
			const body = await resp.text()
			const $ = cheerio.load(body)
			const value = $("meta[name=\"price\"]").attr("content").replace(",","")
			log.info(`...OK[${value}}`)
			return value
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = MarketWatch