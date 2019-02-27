const expect = require("chai").expect;
const nock = require("nock");
const fs = require("fs");
const path = require("path");
const newsApi = require("../modules/news-api");

const rssUrl = {
    site: "http://site.com/",
    file: "holidays.xml"
};

describe("NewsApi", () => {
    describe("#getTodayHolidays", () => {

        beforeEach(() => {
            nock(rssUrl.site).get("/" + rssUrl.file).reply(200, fs.readFileSync(path.join(__dirname, rssUrl.file)));
        });

        it("Should return  not null message", async () => {
            let message = await newsApi(rssUrl.site + rssUrl.file, new Date(2019, 1, 27));
            //console.log(message);
            expect(message.text).to.not.be.null;
            expect(message.link).to.not.be.null;
        });

    });
});