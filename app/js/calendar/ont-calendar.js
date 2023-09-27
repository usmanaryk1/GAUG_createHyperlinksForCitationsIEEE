	angular
	  .module('mwl.calendar')
	  //.controller('MwlCalendarCtrl', )
	  .directive('mwlCalendar',function() {

	  	var controller  = ["$scope", "$log", "$timeout", "$attrs", "$locale", "moment", "calendarTitle", function($scope, $log, $timeout, $attrs, $locale, moment, calendarTitle) {

	    //var $scope = this;

	    $scope.events = $scope.events || [];

	    $scope.changeView = function(view, newDay) {
	      $scope.view = view;
	      $scope.currentDay = newDay;
	    };

	    $scope.drillDown = function(date) {

	      var rawDate = moment(date).toDate();

	      if ($scope.onDrillDownClick({calendarDate: rawDate, calendarNextView: nextView[$scope.view]}) !== false) {
	        $scope.changeView(nextView[$scope.view], rawDate);
	      }

	    };

		var previousDate = moment($scope.currentDay);
	    var previousView = $scope.view;

	    function eventIsValid(event) {
	      if (!event.startsAt) {
	        $log.warn('Bootstrap calendar: ', 'Event is missing the startsAt field', event);
	      }

	      if (!angular.isDate(event.startsAt)) {
	        $log.warn('Bootstrap calendar: ', 'Event startsAt should be a javascript date object', event);
	      }

	      if (angular.isDefined(event.endsAt)) {
	        if (!angular.isDate(event.endsAt)) {
	          $log.warn('Bootstrap calendar: ', 'Event endsAt should be a javascript date object', event);
	        }
	        if (moment(event.startsAt).isAfter(moment(event.endsAt))) {
	          $log.warn('Bootstrap calendar: ', 'Event cannot start after it finishes', event);
	        }
	      }

	      return true;
	    }

	    function refreshCalendar() {

	      if (calendarTitle[$scope.view] && angular.isDefined($attrs.viewTitle)) {
	        $scope.viewTitle = calendarTitle[$scope.view]($scope.currentDay);
	      }

	      $scope.events = $scope.events.filter(eventIsValid).map(function(event, index) {
	        Object.defineProperty(event, '$id', {enumerable: false, configurable: true, value: index});
	        return event;
	      });

	      //if on-timespan-click="calendarDay = calendarDate" is set then don't update the view as nothing needs to change
	      var currentDate = moment($scope.currentDay);
	      var shouldUpdate = true;
	      if (
	        previousDate.clone().startOf($scope.view).isSame(currentDate.clone().startOf($scope.view)) &&
	        !previousDate.isSame(currentDate) &&
	        $scope.view === previousView
	      ) {
	        shouldUpdate = false;
	      }
	      previousDate = currentDate;
	      previousView = $scope.view;

	      if (shouldUpdate) {
	        // a $timeout is required as $broadcast is synchronous so if a new events array is set the calendar won't update
	        $timeout(function() {
	          $scope.$broadcast('calendar.refreshView');
	        });
	      }
	    }

	    var eventsWatched = false;

	    //Refresh the calendar when any of these variables change.
	    $scope.$watch(
	      'cellIsOpen'
	    , function() {
	      if (!eventsWatched) {
	        eventsWatched = true;
	        //need to deep watch events hence why it isn't included in the watch group
	        $scope.$watch('vm.events', refreshCalendar, true); //this will call refreshCalendar when the watcher starts (i.e. now)
	      } else {
	        refreshCalendar();
	      }
	    });

	    $scope.$watch(
	      'view'
	    , function() {
	      if (!eventsWatched) {
	        eventsWatched = true;
	        //need to deep watch events hence why it isn't included in the watch group
	        $scope.$watch('vm.events', refreshCalendar, true); //this will call refreshCalendar when the watcher starts (i.e. now)
	      } else {
	        refreshCalendar();
	      }
	    });

	    $scope.$watch(
	      'currentDay'
	    , function() {
	      if (!eventsWatched) {
	        eventsWatched = true;
	        //need to deep watch events hence why it isn't included in the watch group
	        $scope.$watch('vm.events', refreshCalendar, true); //this will call refreshCalendar when the watcher starts (i.e. now)
	      } else {
	        refreshCalendar();
	      }
	    });

	  }];
	    return {
	      templateUrl: 'templates/calendar.html',
	      restrict: 'EA',
	      scope: {
	        events: '=',
	        view: '=',
	        viewTitle: '=?',
	        currentDay: '=',
	        editEventHtml: '=',
	        deleteEventHtml: '=',
	        cellIsOpen: '=',
	        onEventClick: '&',
	        onEventTimesChanged: '&',
	        onEditEventClick: '&',
	        onDeleteEventClick: '&',
	        onTimespanClick: '&',
	        onDrillDownClick: '&',
	        cellModifier: '&',
	        dayViewStart: '@',
	        dayViewEnd: '@',
	        dayViewSplit: '@',
	        monthCellTemplateUrl: '@',
	        monthCellEventsTemplateUrl: '@'
	      },
	      controller: controller
	    };

	  });