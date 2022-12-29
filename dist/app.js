"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const log4js_1 = __importDefault(require("log4js"));
const log = log4js_1.default.getLogger("main");
log.level = "info";
const telegraf_1 = __importDefault(require("telegraf"));
const bot = new telegraf_1.default(config_1.default.telegram.token);
const prod_cal_1 = __importDefault(require("prod-cal"));
const prodCalendar = new prod_cal_1.default("ru");
const moex_api_1 = __importDefault(require("moex-api"));
const market_watch_1 = require("./stock/market-watch");
const cron_1 = require("cron");
const stock_api_1 = require("./stock/stock-api");
const stockAPI = new stock_api_1.StockAPIImpl(log4js_1.default.getLogger, new moex_api_1.default(), new market_watch_1.MarketWatchImpl());
const start_route_1 = __importDefault(require("./routes/start-route"));
const startRouter = new start_route_1.default(log);
const stock_route_1 = __importDefault(require("./routes/stock-route"));
const stockHandler = new stock_route_1.default(log, bot, stockAPI);
const schedule_stock_route_1 = __importDefault(require("./routes/schedule-stock-route"));
const scheduleStockRoute = new schedule_stock_route_1.default(log, bot, stockAPI, prodCalendar, config_1.default);
const text_route_1 = __importDefault(require("./routes/text-route"));
const textRoute = new text_route_1.default(log, bot, stockAPI);
const cron = {
    stock: "0 5 10,17 * * * "
};
log.info(`Topic Stock started at ${cron.stock}`);
new cron_1.CronJob({
    cronTime: cron.stock,
    onTick: () => scheduleStockRoute.handle(),
    start: true
});
bot.command("start", startRouter.handle);
bot.command("stock", stockHandler.handle);
bot.on("text", textRoute.handle);
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
