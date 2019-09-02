//const config = require("./config.js");
//const MessageApi = require("./modules/message-api.js");
//const TelegramBotApi = require("node-telegram-bot-api");
//const telegramBot = new TelegramBotApi(config.telegram.token, config.telegram.params);

//const messageApi = new MessageApi(telegramBot);

const weatherApi = require("weather-js");
const ProdCalendar = require("prod-cal");
const Calendar = require("./lib/calendar");

const Weather = require("./lib/weather");

let weather = new Weather(new Calendar(new ProdCalendar("ru")), weatherApi);

weather.get(new Date()).then(e => console.log(e));
