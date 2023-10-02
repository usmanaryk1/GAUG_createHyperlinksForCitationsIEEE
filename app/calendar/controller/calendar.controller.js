(function() {
    function CalendarCtrl(Page) {
        var ctrl = this;

        Page.setTitle("Calendar");
        this.calendarView = 'month';
		this.calendarDay = new Date();

		this.changeToMonth = function () {
			this.calendarView = 'month';
		}

		this.changeToWeek = function () {
			this.calendarView = 'week';
		}
    }
 
    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", CalendarCtrl]);
})();
