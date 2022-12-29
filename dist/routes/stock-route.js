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
const abstract_stock_route_1 = __importDefault(require("./abstract-stock-route"));
class StockRoute extends abstract_stock_route_1.default {
    handle(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /stock`);
            try {
                yield this.sendStockMessage({ id: ctx.message.from.id, name: ctx.message.from.username });
            }
            catch (err) {
                this.log.error(err);
            }
        });
    }
}
exports.default = StockRoute;
