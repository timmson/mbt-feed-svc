const MessageApi = require('./modules/message-api.js');

const messageApi = new MessageApi({
    host: "localhost",
    port: "8080"
});
messageApi.sendMessage({
    to: {
        id: 168739439,
        username: "timmson"
    },
    version: 2,
    type: "image_link",
    text: "test",
    image: "https://avatars.mds.yandex.net/get-banana/26007/__5EwYHovRzhpxPqxC6GH_banana_20161021_babochka-1.png/optimize",
    url: "https://ya.ru",
    isLike: false
}).catch(console.err);