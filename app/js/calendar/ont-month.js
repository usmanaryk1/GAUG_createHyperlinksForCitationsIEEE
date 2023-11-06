angular
	  .module('mwl.calendar')
	  .directive('mwlCalendarMonth',function() {

	  	var controller = ["$scope", "moment", "calendarHelper", "calendarConfig", function($scope, moment, calendarHelper, calendarConfig) {

	    $scope.calendarConfig = calendarConfig;
	    $scope.openRowIndex = null;

	    $scope.$on('calendar.refreshView', function() {

	      $scope.weekDays = calendarHelper.getWeekDayNames();

	      $scope.view = calendarHelper.getMonthView($scope.events, $scope.currentDay,1);
	      var rows = Math.floor($scope.view.length / 7);
	      $scope.monthOffsets = [];
	      for (var i = 0; i < rows; i++) {
	        $scope.monthOffsets.push(i * 7);
	      }

	    });

	    $scope.dayClicked = function(day, dayClickedFirstRun, $event) {

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
	        cellTemplateUrl: '@',
	        cellEventsTemplateUrl: '@'
	      },
	      controller: controller
	    };

	  });