const log = require('log4js').getLogger('message');

function MessageApi(telegramBot) {
    this.telegramBot = telegramBot
}

MessageApi.prototype.sendMessage = async function (message) {
    const replyMarkup = message.isLike ? this.getLikeButton(getRandomInt(0, 15)) : (message.url ? JSON.stringify({
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


MessageApi.prototype.getLikeButton = function(cnt) {
    return JSON.stringify({inline_keyboard: [[{text: "👍" + cnt, callback_data: "" + (cnt + 1)}]]});
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = MessageApi;