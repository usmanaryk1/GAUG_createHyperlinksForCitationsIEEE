angular
	  .module('mwl.calendar')
	  //.controller('MwlCalendarWeekCtrl',
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function($scope, $sce, moment, calendarHelper, calendarConfig) {

	    //var $scope = this;
	    $scope.showTimes = true;
	    $scope.$sce = $sce;
	    $scope.hours = [{'name':'Jayesh'},{'name':'Yash'}]

	    $scope.$on('calendar.refreshView', function() {
	      $scope.dayViewSplit = $scope.dayViewSplit || 30;
	      $scope.dayViewHeight = calendarHelper.getDayViewHeight(
	        $scope.dayViewStart,
	        $scope.dayViewEnd,
	        $scope.dayViewSplit
	      );
	      // if ($scope.showTimes) {
	      //   $scope.view = calendarHelper.getWeekViewWithTimes(
	      //     $scope.events,
	      //     $scope.currentDay,
	      //     $scope.dayViewStart,
	      //     $scope.dayViewEnd,
	      //     $scope.dayViewSplit
	      //   );
	      // } else {
	        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay);
	      // }
	    });

	    $scope.weekDragged = function(event, daysDiff, minuteChunksMoved) {

	      var newStart = moment(event.startsAt).add(daysDiff, 'days');
	      var newEnd = moment(event.endsAt).add(daysDiff, 'days');

	      if (minuteChunksMoved) {
	        var minutesDiff = minuteChunksMoved * $scope.dayViewSplit;
	        newStart = newStart.add(minutesDiff, 'minutes');
	        newEnd = newEnd.add(minutesDiff, 'minutes');
	      }

	      delete event.tempStartsAt;

	      $scope.onEventTimesChanged({
	        calendarEvent: event,
	        calendarNewEventStart: newStart.toDate(),
	        calendarNewEventEnd: event.endsAt ? newEnd.toDate() : null
	      });
	    };

	    $scope.weekResized = function(event, edge, daysDiff) {

	      var start = moment(event.startsAt);
	      var end = moment(event.endsAt);
	      if (edge === 'start') {
	        start.add(daysDiff, 'days');
	      } else {
	        end.add(daysDiff, 'days');
	      }

	      $scope.onEventTimesChanged({
	        calendarEvent: event,
	        calendarNewEventStart: start.toDate(),
	        calendarNewEventEnd: end.toDate()
	      });

	    };

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
	        onTimespanClick: '='
	      },
	      controller: controller,
	      link: function(scope, element, attrs, calendarCtrl) {
	        //scope.$scope.calendarCtrl = calendarCtrl;
	      }
	    };

	  });
