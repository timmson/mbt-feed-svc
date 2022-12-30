import {TelegrafContext} from "telegraf/typings/context"

export interface MoexAPI {

	getIndexPrice(): Promise<number>

	getUSDPrice(): Promise<number>

}

export interface MarketWatchAPI {

	getIndexPrice(ticket: string): Promise<number>
}

export interface StockAPI {

	getMessageFromRuStockExchange(): Promise<string>

	getMessageFromIntStockExchange(): Promise<string>
}

export interface RouteHandler {

	handle(ctx?: TelegrafContext)

}
