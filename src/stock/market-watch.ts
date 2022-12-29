import axios from "axios"
import cheerio from "cheerio"
import {MarketWatch} from "../interfaces"

const baseUrl = "https://www.marketwatch.com/investing"

export class MarketWatchImpl implements MarketWatch{

	async getIndexPrice(ticket: string): Promise<number> {
		return this.getStockPrice("index", ticket)
	}

	async getStockPrice(type: string, ticket: string): Promise<number> {
		const url = [baseUrl, type, ticket].join("/")
		const response = await axios.get(url)

		if (response.statusText !== "OK") {
			throw new Error(`${url} ${response.status} ${response.data}`)
		}

		const $ = cheerio.load(response.data)
		const value = $("meta[name=\"price\"]").attr("content").replace(",", "")

		return parseFloat(value)
	}
}
