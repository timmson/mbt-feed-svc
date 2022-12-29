import AbstractStockRoute from "./abstract-stock-route"
import Calendar from "prod-cal"
import Telegraf from "telegraf"
import {StockAPI} from "../interfaces"
import {RouteHandler} from "../interfaces"

class ScheduleStockRoute extends AbstractStockRoute implements RouteHandler {
	private prodCalendar: Calendar
	private config: any

	constructor(log: any, bot: Telegraf<any>, stockAPI: StockAPI, prodCalendar: Calendar, config: any) {
		super(log, bot, stockAPI)
		this.prodCalendar = prodCalendar
		this.config = config
	}

	async handle() {
		try {
			if (this.prodCalendar.getDate(new Date()) !== Calendar.DAY_HOLIDAY) {
				await this.sendStockMessage({id: this.config.stockChannel, name: this.config.stockChannel})
			} else {
				this.log.info("Stock - nothing to send")
			}
		} catch (e) {
			this.log.error(e)
		}
	}

}

export default ScheduleStockRoute