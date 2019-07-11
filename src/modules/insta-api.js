const log = require("log4js").getLogger("insta");
const Client = require("instagram-private-api").IgApiClient;

log.level = "info";

let that = null;

function InstaApi(config) {
    that = this;
    that.config = config;
    that.client = new Client();
    that.client.state.generateDevice(that.config.username);
    that.mediaType = 1;
}

InstaApi.prototype.notifyAboutMemes = function () {
    return new Promise(async (resolve, reject) => {
        try {
            await that.client.simulate.preLoginFlow();
            /*const loggedInUser =*/ await that.client.account.login(that.config.username, that.config.password);
            process.nextTick(async () => await that.client.simulate.postLoginFlow());

            let hashTags = await that.client.feed.tag(that.config.tag).items();

            let messages = hashTags.filter((post) => that.mediaType ? post.media_type === that.mediaType : true)
                .filter((post) => that.config.skip ? that.config.skip.indexOf(post.user.username) === -1 : true)
                .slice(0, that.config.limit).map((post) => {
                    let message = {
                        post: "https://www.instagram.com/" + post.user.username + "/",
                        image: post.image_versions2.candidates.sort((a, b) => a.width > b.width).pop().url
                    };
                    log.info("Message: " + JSON.stringify(message));
                    return message;
                });
            resolve(messages);

        } catch (err) {
            log.error("Insta error:" + err.toString());
            reject(err);
        }
    });

};

module.exports = InstaApi;
