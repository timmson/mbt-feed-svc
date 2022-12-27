const cheerio = require("cheerio")
const baseUrl = "https://www.marketwatch.com/investing/index/"

class MarketWatch {

	async getStockPrice(ticket) {
		try {
			const url = `${baseUrl + ticket}`
			const resp = await fetch(url)
			const body = await resp.text()
			const $ = cheerio.load(body)
			return $("meta[name=\"price\"]").attr("content")
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = MarketWatch