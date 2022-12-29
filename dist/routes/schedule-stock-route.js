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
const prod_cal_1 = __importDefault(require("prod-cal"));
class ScheduleStockRoute extends abstract_stock_route_1.default {
    constructor(log, bot, stockAPI, prodCalendar, config) {
        super(log, bot, stockAPI);
        this.prodCalendar = prodCalendar;
        this.config = config;
    }
    handle() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.prodCalendar.getDate(new Date()) !== prod_cal_1.default.DAY_HOLIDAY) {
                    yield this.sendStockMessage({ id: this.config.stockChannel, name: this.config.stockChannel });
                }
                else {
                    this.log.info("Stock - nothing to send");
                }
            }
            catch (e) {
                this.log.error(e);
            }
        });
    }
}
exports.default = ScheduleStockRoute;
