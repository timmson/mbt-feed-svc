const config = require("./config.js");
//const MessageApi = require("./modules/message-api.js");
//const TelegramBotApi = require("node-telegram-bot-api");
//const telegramBot = new TelegramBotApi(config.telegram.token, config.telegram.params);

//const messageApi = new MessageApi(telegramBot);

const newsApi = require("./modules/news-api.js");

function MessageApi() {

}

MessageApi.prototype.sendMessage = function (message) {
    return new Promise(
        (resolve) => {
            console.log(JSON.stringify(message, null, 2));
            resolve(0);
        },
    )
};

let messageApi = new MessageApi();


config.topics.forEach(async (topic) => {
    try {
        let messages = await newsApi(topic.url, new Date());
        console.log(messages);
        messages.forEach(async (message) =>
            await messageApi.sendMessage({
                to: {
                    id: topic.channel,
                    username: topic.channel
                },
                version: "2",
                type: "link",
                text: message.title,
                url: message.link
            })
        );
    } catch (err) {
        console.error(err);
    }
});
