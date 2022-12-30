import axios from "axios"
import {MoexAPIImpl} from "../../src/stock/moex-api"

jest.mock("axios")

const buildResponse = (price: number) => {
	return {statusText: "OK", data: {marketdata: {data: [[0, 0, 0, 0, price]]}}}
}

describe("MoexAPI should", () => {

	const moexAPI = new MoexAPIImpl()

	test("fetch MOEX index", async () => {
		const expected = 1234.56
		axios.get.mockResolvedValueOnce(buildResponse(expected))

		const result = await moexAPI.getIndexPrice()

		expect(result).toEqual(expected)
	})

	test("fetch USD/RUB rate", async () => {
		const expected = 1234.56
		axios.get.mockResolvedValueOnce(buildResponse(expected))

		const result = await moexAPI.getUSDPrice()

		expect(result).toEqual(expected)
	})

	test("throw error when response is not OK", async () => {
		const expectedError = "https://iss.moex.com/iss/engines/currency/markets/selt/securities/USD000UTSTOM.json undefined undefined"

		axios.get.mockResolvedValueOnce({statusText: "Not ok"})

		await expect(moexAPI.getUSDPrice()).rejects.toEqual(expectedError)
	})


})