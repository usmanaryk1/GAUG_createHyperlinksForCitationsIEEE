(function() {
    function CalendarCtrl(Page) {
        var ctrl = this;

        Page.setTitle("Calendar");

        this.calendarView = 'month';
        this.isOpen = false;
		this.calendarDay = new Date();

		this.changeToMonth = function () {
			this.calendarView = 'month';
		}

		this.showDatepicker = function () {
			console.log(this.isOpen);
			if (this.isOpen) {
	            this.isOpen = false;
	        } else {
	            this.isOpen = true;
	        }   
		}

		this.changeToWeek = function () {
			this.calendarView = 'week';
		}
    }
 
    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", CalendarCtrl]);
})();
