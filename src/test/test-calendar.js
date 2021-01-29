const Calendar = require("../lib/calendar");

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
		test("as '1 сентября, рабочий день' when gets 1.9.2019", () => {
			let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 1)));

			expect(result).toEqual("1 сентября, рабочий день");
		});

		test("as '2 сентября, выходной' when gets 2.9.2019", () => {
			let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 2)));

			expect(result).toEqual("2 сентября, выходной");
		});

		test("as '3 сентября сокращенный рабочий день', выходной when gets 3.9.2019", () => {
			let result = calendar.formatDate(new Date(Date.UTC(2019, 9 - 1, 3)));

			expect(result).toEqual("3 сентября, сокращенный рабочий день");
		});
	});

	test("return tomorrow as '2019-09-02' when gets 1.9.2019", () => {
		let result = calendar.getTomorrow(new Date(Date.UTC(2019, 9 - 1, 1)));

		expect("2019-09-02").toEqual(result);
	});

});