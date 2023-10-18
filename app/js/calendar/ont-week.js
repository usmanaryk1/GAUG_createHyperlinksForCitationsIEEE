angular
	  .module('mwl.calendar')
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function($scope, $sce, moment, calendarHelper, calendarConfig) {

	    $scope.showTimes = true;
	    $scope.$sce = $sce;
            
	    $scope.$on('calendar.refreshView', function() {
	      $scope.dayViewSplit = $scope.dayViewSplit || 30;
	      $scope.dayViewHeight = calendarHelper.getDayViewHeight(
	        $scope.dayViewStart,
	        $scope.dayViewEnd,
	        $scope.dayViewSplit
	      );
	        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay);
	    });

	    $scope.tempTimeChanged = function(event, minuteChunksMoved) {
	      var minutesDiff = minuteChunksMoved * $scope.dayViewSplit;
	      event.tempStartsAt = moment(event.startsAt).add(minutesDiff, 'minutes').toDate();
	    };

	  }];
	    return {
	      templateUrl: 'templates/calendarWeekView.html',
	      restrict: 'EA',
	      require: '^mwlCalendar',
	      scope: {
	        events: '=',
	        currentDay: '=',
	        onEventClick: '=',
	        onEventTimesChanged: '=',
	        dayViewStart: '=',
	        dayViewEnd: '=',
	        dayViewSplit: '=',
	        onTimespanClick: '=',
            hours:'=',
            totalItems:'=',
            currentPage:'='
	      },
	      controller: controller,
	      link: function(scope, element, attrs, calendarCtrl) {
	        //scope.$scope.calendarCtrl = calendarCtrl;
	      }
	    };

	  });
