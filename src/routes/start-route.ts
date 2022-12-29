import {TelegrafContext} from "telegraf/typings/context"
import AbstractRouter from "./abstract-router"
import {RouteHandler} from "../interfaces"

export default class StartRoute extends AbstractRouter implements RouteHandler {

	async handle(ctx: TelegrafContext) {
		this.log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /start`)
		try {
			await ctx.reply("Ok!")
		} catch (err) {
			this.log.error(err)
		}
	}
}