const Calendar = require("../lib/calendar");
const {expect} = require("chai");
require("mocha");

class ProdCalendar {

    getCalendar(year, month, day) {
        if (day === 1) {
            return "work";
        } else if (day === 2) {
            return "holiday";
        } else {
            return "work_reduced";
        }
    }
}

describe("Calendar should", () => {

    let calendar = new Calendar(new ProdCalendar());


    describe("format date ", () => {
        it("as '1 сентября, рабочий день' when gets 1.9.2019", () => {
            let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 1)));

            expect(result).to.be.eq("1 сентября, рабочий день");
        });

        it("as '2 сентября, выходной' when gets 2.9.2019", () => {
            let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 2)));

            expect(result).to.be.eq("2 сентября, выходной");
        });

        it("as '3 сентября сокращенный рабочий день', выходной when gets 3.9.2019", () => {
            let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 3)));

            expect(result).to.be.eq("3 сентября, сокращенный рабочий день");
        });
    });

    it("return tomorrow as '2019-09-02' when gets 1.9.2019", () => {
        let result = calendar.getTomorrow(new Date(Date.UTC(2019, 9 - 1, 1)));

        expect("2019-09-02").to.be.eq(result);
    });

});