import AbstractStockRoute from "./abstract-stock-route"
import {TelegrafContext} from "telegraf/typings/context"
import {RouteHandler} from "../interfaces"

export default class TextRoute extends AbstractStockRoute implements RouteHandler {

	async handle(ctx: TelegrafContext) {
		this.log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${ctx.message.text}`)
		try {
			const priceFromRuSE = await this.stockAPI.getTickerPriceFromMoex(ctx.message.text)
			this.log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${priceFromRuSE}`)
			await this.bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: ${priceFromRuSE}`, {"parse_mode": "HTML"})
		} catch (err) {
			await this.bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: not found.`, {"parse_mode": "HTML"})
			this.log.error(err)
		}
	}

}