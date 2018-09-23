const log = require('log4js').getLogger('message');
const r = require("request");

function MessageApi(telegramBot) {
    this.telegramBot = telegramBot
}

MessageApi.prototype.sendMessage = function (message, likeButton) {
    const replyMarkup = message.isLike ? likeButton : (message.url ? JSON.stringify({
        inline_keyboard: [[{
            text: "🌍",
            url: message.url
        }]]
    }) : null);

    switch (message.type) {
        case "text":
            log.info(message.to.username + " <- " + "[text:" + message.text + "]");
            return this.telegramBot.sendMessage(message.to.id, message.text, {});

        case "link":
            log.info(message.to.username + " <- " + "[link:" + message.text + "]");
            return this.telegramBot.sendMessage(message.to.id, message.text, {
                parse_mode: "HTML",
                reply_markup: replyMarkup
            });

        case "image_link":
            log.info(message.to.username + " <- " + "[image:" + message.image + "]");
            return this.telegramBot.sendPhoto(message.to.id, r(message.image), {
                caption: message.text,
                reply_markup: replyMarkup
            });

        case "video_link":
            log.info(message.to.username + " <- " + "[video:" + message.video + "]");
            return this.telegramBot.sendVideo(message.to.id, r(message.video), {
                caption: message.text,
                reply_markup: replyMarkup
            });
    }

};


module.exports = MessageApi;