const log = require("log4js").getLogger("insta");
const Client = require("instagram-private-api").IgApiClient;

log.level = "info";

let that = null;

function InstaApi(config) {
    that = this;
    that.client = new Client();
    that.client.state.generateDevice(config.username);
    that.config = config
}

InstaApi.prototype.notifyAboutMemes = function () {
    return new Promise(async (resolve, reject) => {
        try {
            await that.client.simulate.preLoginFlow();
            const loggedInUser = await that.client.account.login(that.config.user, that.config.password);
            process.nextTick(async () => await that.client.simulate.postLoginFlow());

            let hashTags = await client.feed.tag("cool").items();

            /*let posts = hashTags.map((post) => post.getParams())
                .filter((post) => this.mediaType ? post.mediaType === this.mediaType : true)
                .filter((post) => this.config.skip ? this.config.skip.indexOf(post.account.username) === -1 : true)
                .slice(0, this.config.limit);

            let messages = posts.map((post) => {
                let message = {
                    post: post.webLink,
                    image: post.images.sort((a, b) => a.width > b.width).pop().url
                };
                log.info("Message: " + JSON.stringify(message));
                return message;
            });
            resolve(messages);*/

            resolve(hashTags);

        } catch (err) {
            log.error("Insta error:" + err.toString());
            reject(err);
        }
    });


/*    return new Promise(async (resolve, reject) => {
        try {
            let session = await Client.Session.create(this.device, this.storage, this.config.user, this.config.password);
            let hashTags = await new Client.Feed.TaggedMedia(session, this.config.tag, 2).get();

            let posts = hashTags.map((post) => post.getParams())
                .filter((post) => this.mediaType ? post.mediaType === this.mediaType : true)
                .filter((post) => this.config.skip ? this.config.skip.indexOf(post.account.username) === -1 : true)
                .slice(0, this.config.limit);

            let messages = posts.map((post) => {
                let message = {
                    post: post.webLink,
                    image: post.images.sort((a, b) => a.width > b.width).pop().url
                };
                log.info("Message: " + JSON.stringify(message));
                return message;
            });
            resolve(messages);
        } catch (err) {
            log.error("Insta error:" + err.toString());
            reject(err);
        }
    });*/
};

module.exports = InstaApi;