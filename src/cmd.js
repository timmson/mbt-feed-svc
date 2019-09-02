//const config = require("./config.js");
//const MessageApi = require("./modules/message-api.js");
//const TelegramBotApi = require("node-telegram-bot-api");
//const telegramBot = new TelegramBotApi(config.telegram.token, config.telegram.params);

//const messageApi = new MessageApi(telegramBot);

const weatherApi = require("./modules/weather-api");


weatherApi(new Date()).then(e => console.log(e));
