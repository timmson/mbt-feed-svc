"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockAPIImpl = void 0;
class StockAPIImpl {
    constructor(log, moexAPI, marketWatchAPI, timeout) {
        this.log = log;
        this.moexAPI = moexAPI;
        this.marketWatchAPI = marketWatchAPI;
        this.times = 0;
        this.maxTried = 2;
        this.timeout = timeout || 2;
    }
    getMessageFromRuStockExchange() {
        return new Promise(((resolve, reject) => {
            Promise.all([
                this.moexAPI.getUSDPrice(),
                this.moexAPI.getIndexPrice()
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
                this.marketWatchAPI.getIndexPrice("spx"),
                this.marketWatchAPI.getIndexPrice("shcomp?countrycode=cn")
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
