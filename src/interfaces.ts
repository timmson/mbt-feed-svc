import {TelegrafContext} from "telegraf/typings/context"

export interface MarketWatch {

	getIndexPrice(ticket: string): Promise<number>
}

export interface StockAPI {
	getTickerPriceFromMoex(ticker: string, currency?: string): Promise<number>

	getMessageFromRuStockExchange(): Promise<string>

	getMessageFromIntStockExchange(): Promise<string>
}

export interface RouteHandler {

	handle(ctx?: TelegrafContext)

}