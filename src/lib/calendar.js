class Calendar {

	constructor(prodCalendar) {
		this.prodCalendar = prodCalendar;

		this.months = ["января", "февраля", "марта", "апреля", "мая", "июня",
			"июля", "августа", "сентября", "октября", "ноября", "декабря"];

		this.dayTypes = {
			"work": "рабочий день",
			"work_reduced": "сокращенный рабочий день",
			"holiday": "выходной"
		};
	}

	formatDate(date) {
		let dayType = this.prodCalendar.getCalendar(date.getFullYear(), date.getMonth() + 1, date.getDate());
		return [date.getDate(), this.months[date.getMonth()] + ",", this.dayTypes[dayType]].join(" ");
	}

	getTomorrow(date) {
		return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1)).toISOString().split("T")[0];
	}

}

module.exports = Calendar;