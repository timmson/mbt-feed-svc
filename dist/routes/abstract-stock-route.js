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
const abstract_router_1 = __importDefault(require("./abstract-router"));
class AbstractStockRoute extends abstract_router_1.default {
    constructor(log, bot, stockAPI) {
        super(log);
        this.bot = bot;
        this.stockAPI = stockAPI;
    }
    sendStockMessage({ id, name }) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageFromRuSE = yield this.stockAPI.getMessageFromRuStockExchange();
            this.log.info(`${id} [${name}] <- ${messageFromRuSE}`);
            yield this.bot.telegram.sendMessage(id, messageFromRuSE, { "parse_mode": "HTML" });
            const messageFromIntSE = yield this.stockAPI.getMessageFromIntStockExchange();
            this.log.info(`${id} [${name}] <- ${messageFromIntSE}`);
            yield this.bot.telegram.sendMessage(id, messageFromIntSE, { "parse_mode": "HTML" });
        });
    }
}
exports.default = AbstractStockRoute;
