(function() {
    function CalendarCtrl(Page) {
        var ctrl = this;

        Page.setTitle("Calendar");
        this.calendarView = 'month';
		this.calendarDay = new Date();
    }
 
    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", CalendarCtrl]);
})();
