const cheerio = require("cheerio")
const axios = require("axios")

const baseUrl = "https://www.marketwatch.com/investing"

class MarketWatch {

	async getIndexPrice(ticket) {
		return this.getStockPrice("index", ticket)
	}

	async getStockPrice(type, ticket) {
		const url = [baseUrl, type, ticket].join("/")
		const response = await axios.get(url)

		if (response.statusText !== "OK") {
			throw new Error(`${url} ${response.status} ${response.data}`)
		}

		const $ = cheerio.load(response.data)
		const value =  $("meta[name=\"price\"]").attr("content").replace(",", "")

		return parseFloat(value)
	}
}

module.exports = MarketWatch