import axios from "axios"
import {MarketWatchImpl} from "../../src/stock/market-watch-api"

jest.mock("axios")

const buildResponse = (price: number) => {
	return {
		statusText: "OK",
		data: "<meta name=\"price\" content=\"" + price + "\"/>"
	}

}

describe("MarketWatchAPI should", () => {

	const marketWatchAPI = new MarketWatchImpl()

	test("fetch SPX index", async () => {
		const expected = 1234.78

		axios.get.mockResolvedValueOnce(buildResponse(expected))

		const result = await marketWatchAPI.getIndexPrice("SPX")

		expect(result).toEqual(expected)
	})

	test("throw error when response is not OK", async () => {
		const expectedError = "https://www.marketwatch.com/investing/index/SPZ undefined undefined"

		axios.get.mockResolvedValueOnce({statusText: "Not ok"})

		await expect(marketWatchAPI.getIndexPrice("SPZ")).rejects.toEqual(expectedError)
	})

})