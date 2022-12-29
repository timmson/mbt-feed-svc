import Telegraf from "telegraf"
import AbstractRouter from "./abstract-router"
import {StockAPI} from "../interfaces"

class AbstractStockRoute extends AbstractRouter {

	protected readonly bot: any
	protected readonly stockAPI: StockAPI

	constructor(log: any, bot: Telegraf<any>, stockAPI: StockAPI) {
		super(log)
		this.bot = bot
		this.stockAPI = stockAPI
	}

	protected async sendStockMessage({id, name}) {
		const messageFromRuSE = await this.stockAPI.getMessageFromRuStockExchange()
		this.log.info(`${id} [${name}] <- ${messageFromRuSE}`)
		await this.bot.telegram.sendMessage(id, messageFromRuSE, {"parse_mode": "HTML"})

		const messageFromIntSE = await this.stockAPI.getMessageFromIntStockExchange()
		this.log.info(`${id} [${name}] <- ${messageFromIntSE}`)
		await this.bot.telegram.sendMessage(id, messageFromIntSE, {"parse_mode": "HTML"})
	}

}

export default AbstractStockRoute