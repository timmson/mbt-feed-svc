const log = require('log4js').getLogger('message');
const r = require("request");

function MessageApi(telegramBot) {
    this.telegramBot = telegramBot
}

MessageApi.prototype.sendMessage = async function (message, likeButton) {
    const replyMarkup = message.isLike ? likeButton : (message.url ? JSON.stringify({
        inline_keyboard: [[{
            text: "🌍",
            url: message.url
        }]]
    }) : null);
    try {
        switch (message.type) {
            case "text":
                log.info(message.to.username + " <- " + "[text:" + message.text + "]");
                await this.telegramBot.sendMessage(message.to.id, message.text, {});
                break;
            case "link":
                log.info(message.to.username + " <- " + "[link:" + message.text + "]");
                await this.telegramBot.sendMessage(message.to.id, message.text, {
                    parse_mode: "HTML",
                    reply_markup: replyMarkup
                });
                break;
            case "image_link":
                log.info(message.to.username + " <- " + "[image:" + message.image + "]");
                await this.telegramBot.sendPhoto(message.to.id, r(message.image), {
                    caption: message.text,
                    reply_markup: replyMarkup
                });
                break;

            case "video_link":
                log.info(message.to.username + " <- " + "[video:" + message.video + "]");
                await this.telegramBot.sendPhoto(message.to.id, r(message.video), {
                    caption: message.text,
                    reply_markup: replyMarkup
                });
                break;
        }
    } catch (err) {
        log.error(err);
    }
};


module.exports = MessageApi;