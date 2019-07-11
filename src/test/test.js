const InstaApi = require("../modules/insta-api.js");


let instaApi = new InstaApi({
    username: "",
    password: "",
    tag: "мемы",
    count: 2
});

instaApi.notifyAboutMemes().then(r => console.log(r));
