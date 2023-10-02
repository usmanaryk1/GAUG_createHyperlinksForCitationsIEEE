angular
	  .module('mwl.calendar')
	  .directive('mwlCalendarMonth',function() {

	  	var controller = ["$scope", "moment", "calendarHelper", "calendarConfig", function($scope, moment, calendarHelper, calendarConfig) {

	    //var $scope = this;
	    $scope.calendarConfig = calendarConfig;
	    $scope.openRowIndex = null;

	    $scope.$on('calendar.refreshView', function() {

	      $scope.weekDays = calendarHelper.getWeekDayNames();

	      $scope.view = calendarHelper.getMonthView($scope.events, $scope.currentDay, $scope.cellModifier);
	      var rows = Math.floor($scope.view.length / 7);
	      $scope.monthOffsets = [];
	      for (var i = 0; i < rows; i++) {
	        $scope.monthOffsets.push(i * 7);
	      }

	      //Auto open the calendar to the current day if set
	      if ($scope.cellIsOpen && $scope.openRowIndex === null) {
	        $scope.openDayIndex = null;
	        $scope.view.forEach(function(day) {
	          if (day.inMonth && moment($scope.currentDay).startOf('day').isSame(day.date)) {
	            $scope.dayClicked(day, true);
	          }
	        });
	      }

	    });

	    $scope.dayClicked = function(day, dayClickedFirstRun, $event) {

	      if (!dayClickedFirstRun) {
	        $scope.onTimespanClick({
	          calendarDate: day.date.toDate(),
	          $event: $event
	        });
	        if ($event && $event.defaultPrevented) {
	          return;
	        }
	      }

	      $scope.openRowIndex = null;
	      var dayIndex = $scope.view.indexOf(day);
	      if (dayIndex === $scope.openDayIndex) { //the day has been clicked and is already open
	        $scope.openDayIndex = null; //close the open day
	        $scope.cellIsOpen = false;
	      } else {
	        $scope.openDayIndex = dayIndex;
	        $scope.openRowIndex = Math.floor(dayIndex / 7);
	        $scope.cellIsOpen = true;
	      }

	    };

	    $scope.highlightEvent = function(event, shouldAddClass) {

	      $scope.view.forEach(function(day) {
	        delete day.highlightClass;
	        if (shouldAddClass) {
	          var dayContainsEvent = day.events.indexOf(event) > -1;
	          if (dayContainsEvent) {
	            day.highlightClass = 'day-highlight dh-event-' + event.type;
	          }
	        }
	      });

	    };

	    $scope.handleEventDrop = function(event, newDayDate) {

	      var newStart = moment(event.startsAt)
	        .date(moment(newDayDate).date())
	        .month(moment(newDayDate).month());

	      var newEnd = calendarHelper.adjustEndDateFromStartDiff(event.startsAt, newStart, event.endsAt);

	      $scope.onEventTimesChanged({
	        calendarEvent: event,
	        calendarDate: newDayDate,
	        calendarNewEventStart: newStart.toDate(),
	        calendarNewEventEnd: newEnd ? newEnd.toDate() : null
	      });
	    };

	  }];

	    return {
	      templateUrl: "templates/calendarMonthView.html",
	      restrict: 'EA',
	      require: '^mwlCalendar',
	      scope: {
	        events: '=',
	        currentDay: '=',
	        onEventClick: '=',
	        onEditEventClick: '=',
	        onDeleteEventClick: '=',
	        onEventTimesChanged: '=',
	        editEventHtml: '=',
	        deleteEventHtml: '=',
	        cellIsOpen: '=',
	        onTimespanClick: '=',
	        cellModifier: '=',
	        cellTemplateUrl: '@',
	        cellEventsTemplateUrl: '@'
	      },
	      controller: controller,
	      link: function(scope, element, attrs, calendarCtrl) {
	        //scope.$scope.calendarCtrl = calendarCtrl;
	      }
	    };

	  });