import {TelegrafContext} from "telegraf/typings/context"
import AbstractStockRoute from "./abstract-stock-route"
import {RouteHandler} from "../interfaces"

class StockRoute extends AbstractStockRoute implements RouteHandler {

	async handle(ctx: TelegrafContext) {
		this.log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /stock`)
		try {
			await this.sendStockMessage({id: ctx.message.from.id, name: ctx.message.from.username})
		} catch (err) {
			this.log.error(err)
		}
	}

}

export default StockRoute