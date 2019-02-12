module.exports = {
    to: {
        id: 1,
        username: "<yout nick>"
    },

    topics: [
        {
            name: "holidays",
            channel: "@tmsnInstaMemes",
            url: "http://www.calend.ru/img/export/calend.rss",
            cronTime: "0 30 9 * * *",
            limit: 20
        }
    ],

    instagram: {
        channel: "@tmsnInstaMemes",
        user: "<your nick>",
        password: "<your password>",
        tmpDir: "tmp",
        tag: "мемы",
        limit: 2,
        cronTime: "45 9-20 * * *",
        skip: [
            "haypoviyrasvet",
            "blackhumortv",
            "advokat_online_ru",
            "top_seveds",
            "andriu_102",
            "imhd.1"
        ]
    },

    telegram: {
        token: "<your token>",
        params: {
            polling: true
        }
    },

    cron: {
        network: "0 */30 * * * *",
        weather: "0 0 20 * * * "
    }
};