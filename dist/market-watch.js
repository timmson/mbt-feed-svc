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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketWatchImpl = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const baseUrl = "https://www.marketwatch.com/investing";
class MarketWatchImpl {
    getIndexPrice(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getStockPrice("index", ticket);
        });
    }
    getStockPrice(type, ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = [baseUrl, type, ticket].join("/");
            const response = yield axios_1.default.get(url);
            if (response.statusText !== "OK") {
                throw new Error(`${url} ${response.status} ${response.data}`);
            }
            const $ = cheerio_1.default.load(response.data);
            const value = $("meta[name=\"price\"]").attr("content").replace(",", "");
            return parseFloat(value);
        });
    }
}
exports.MarketWatchImpl = MarketWatchImpl;
