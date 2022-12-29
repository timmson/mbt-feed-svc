"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAPIImpl = void 0;
class StockAPIImpl {
    constructor(getLogger, moexApi, marketWatchApi, timeout) {
        this.log = getLogger("stock");
        this.moexApi = moexApi;
        this.marketWatchApi = marketWatchApi;
        this.times = 0;
        this.maxTried = 2;
        this.timeout = timeout || 2;
    }
    getTickerPriceFromMoex(ticker, currency) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.log.info(`Calling MOEX(${ticker},${currency}) ${this.times + 1} of ${this.maxTried + 1}...`);
                const security = yield this.moexApi.securityMarketData(ticker, currency);
                this.times = 0;
                this.log.info(`...MOEX(${ticker},${currency}) = ${security.node.last}`);
                resolve(parseFloat(security.node.last));
            }
            catch (e) {
                this.log.error(e);
                if (this.times < this.maxTried) {
                    this.times++;
                    this.log.error(`Wait ${this.timeout}s until next try...`);
                    setTimeout(() => this.getTickerPriceFromMoex(ticker, currency)
                        .then((result) => resolve(result), (error) => reject(error)), this.timeout * 1000);
                }
                else {
                    reject(e);
                }
            }
        }));
    }
    getMessageFromRuStockExchange() {
        return new Promise(((resolve, reject) => {
            Promise.all([
                this.getTickerPriceFromMoex("USD000UTSTOM"),
                this.getTickerPriceFromMoex("IMOEX")
            ]).then((result) => {
                resolve([
                    "💰" + result[0].toFixed(2),
                    "🇷🇺" + (result[1]).toFixed(2)
                ].join(", "));
            }).catch((err) => reject(err));
        }));
    }
    getMessageFromIntStockExchange() {
        return new Promise(((resolve, reject) => {
            Promise.all([
                this.marketWatchApi.getIndexPrice("spx"),
                this.marketWatchApi.getIndexPrice("shcomp?countrycode=cn")
            ]).then((result) => {
                resolve([
                    "🇺🇸" + (result[0]).toFixed(2),
                    "🇨🇳" + (result[1]).toFixed(2),
                ].join(", "));
            }).catch((err) => reject(err));
        }));
    }
}
exports.StockAPIImpl = StockAPIImpl;
