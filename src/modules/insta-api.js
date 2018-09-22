const {URL} = require("url");
const log = require('log4js').getLogger('insta');
const Client = require("instagram-private-api").V1;

function InstaApi(config) {
    this.config = config;
    this.device = new Client.Device("someuser");
    this.storage = new Client.CookieFileStorage("./" + this.config.tmpDir + "/storage.json");
}

InstaApi.prototype.notifyAboutMemes = async function () {
    return await getPhotoPostsByTag(this.config.tag).filter(post => this.config.skip ? this.config.skip.indexOf(post.account.username) === -1 : true).slice(0, this.config.limit).map(post => {
        let message = {
            to: this.config.channel,
            version: 2,
            url: post.webLink,
            text: this.config.tag,
            isLike: true
        };
        message.type = "image_link";
        message.image = post.images.sort((a, b) => a.width > b.width).pop().url;
        let url = new URL(message.image);
        url.search = "";
        message.image = url.toString();
        log.message("Message: " + JSON.stringify(message));
        return message;
    });
};


function getPhotoPostsByTag(tag) {
    return getMedia(tag, 1)
}

function getMedia(tag, type) {
    return new Promise(async (resolve, reject) => {
        try {
            let session = await Client.Session.create(this.device, this.storage, this.user, this.password);
            let hashTags = await new Client.Feed.TaggedMedia(session, tag, 2).get();
            resolve(hashTags.map(post => post.getParams()).filter(post => type ? post.mediaType === type : true));
        } catch (err) {
            console.error("Insta error:" + err.toString());
            reject(err);
        }
    });
}

module.exports = InstaApi;