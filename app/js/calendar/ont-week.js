angular
	  .module('mwl.calendar')
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", function($scope, $sce, moment, calendarHelper, calendarConfig) {

	    $scope.$sce = $sce;
            
	    $scope.$on('calendar.refreshView', function() {
	    	console.log($scope.list);
	        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay,$scope.list);
	    });

	  }];
	    return {
	      templateUrl: 'templates/calendarWeekView.html',
	      restrict: 'EA',
	      require: '^mwlCalendar',
	      scope: {
	        events: '=',
	        currentDay: '=',
	        onEventClick: '=',
            list:'=',
            totalItems:'=',
            currentPage:'='
	      },
	      controller: controller,
	      link: function(scope, element, attrs, calendarCtrl) {
	        //scope.$scope.calendarCtrl = calendarCtrl;
	      }
	    };

	  });
