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
const config_1 = __importDefault(require("./config"));
const log4js_1 = __importDefault(require("log4js"));
const log = log4js_1.default.getLogger("main");
const telegraf_1 = __importDefault(require("telegraf"));
const prod_cal_1 = __importDefault(require("prod-cal"));
const moex_api_1 = __importDefault(require("moex-api"));
const market_watch_1 = require("./market-watch");
const prod_cal_2 = __importDefault(require("prod-cal"));
const cron_1 = require("cron");
const stock_api_1 = __importDefault(require("./stock-api"));
const stockAPI = new stock_api_1.default(new moex_api_1.default(), new market_watch_1.MarketWatchImpl());
log.level = "info";
const bot = new telegraf_1.default(config_1.default.telegram.token);
const prodCalendar = new prod_cal_1.default("ru");
const cron = {
    stock: "0 5 10,17 * * * "
};
log.info(`Topic Stock started at ${cron.stock}`);
new cron_1.CronJob({
    cronTime: cron.stock,
    onTick: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (prodCalendar.getDate(new Date()) !== prod_cal_2.default.DAY_HOLIDAY) {
                yield sendStockMessage({ id: config_1.default.stockChannel, name: config_1.default.stockChannel });
            }
            else {
                log.info("Stock - nothing to send");
            }
        }
        catch (e) {
            log.error(e);
        }
    }),
    start: true
});
const sendStockMessage = ({ id, name }) => __awaiter(void 0, void 0, void 0, function* () {
    const messageFromRuSE = yield stockAPI.getMessageFromRuStockExchange();
    log.info(`${id} [${name}] <- ${messageFromRuSE}`);
    yield bot.telegram.sendMessage(id, messageFromRuSE, { "parse_mode": "HTML" });
    const messageFromIntSE = yield stockAPI.getMessageFromIntStockExchange();
    log.info(`${id} [${name}] <- ${messageFromIntSE}`);
    yield bot.telegram.sendMessage(id, messageFromIntSE, { "parse_mode": "HTML" });
});
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /start`);
    try {
        yield ctx.reply("Ok!");
    }
    catch (err) {
        log.error(err);
    }
}));
bot.command("stock", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- /stock`);
    try {
        yield sendStockMessage({ id: ctx.message.from.id, name: ctx.message.from.username });
    }
    catch (err) {
        log.error(err);
    }
}));
bot.on("text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${ctx.message.text}`);
    try {
        const priceFromRuSE = yield stockAPI.getTickerPriceFromMoex(ctx.message.text);
        log.info(`${ctx.message.from.username} [${ctx.message.from.id}] <- ${priceFromRuSE}`);
        yield bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: ${priceFromRuSE}`, { "parse_mode": "HTML" });
    }
    catch (err) {
        yield bot.telegram.sendMessage(ctx.message.from.id, `${ctx.message.text}: not found.`, { "parse_mode": "HTML" });
        log.error(err);
    }
}));
bot.startPolling();
bot.telegram.sendMessage(config_1.default.to.id, "Started at " + new Date()).catch((err) => log.error(err));
log.info("Service has started");
log.info("Please press [CTRL + C] to stop");
process.on("SIGINT", () => {
    log.info("Service has stopped");
    process.exit(0);
});
process.on("SIGTERM", () => {
    log.info("Service has stopped");
    process.exit(0);
});
