import axios from "axios"
import {MoexAPI} from "../interfaces"

const baseURL = "https://iss.moex.com/iss/engines"

export class MoexAPIImpl implements MoexAPI {

	async getIndexPrice(): Promise<number> {
		return this.getPrice(`${baseURL}/stock/markets/index/securities/IMOEX.json`)
	}

	async getUSDPrice(): Promise<number> {
		return this.getPrice(`${baseURL}/currency/markets/selt/securities/USD000UTSTOM.json`)
	}

	private async getPrice(url: string): Promise<number> {
		const response = await axios.get(url)

		if (response.statusText !== "OK") {
			return Promise.reject(`${url} ${response.status} ${response.data}`)
		}

		return Promise.resolve(response.data.marketdata.data[0][4])
	}

}