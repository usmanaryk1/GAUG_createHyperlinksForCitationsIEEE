angular
        .module('mwl.calendar')
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", "$rootScope", function($scope, $sce, moment, calendarHelper, calendarConfig, $rootScope) {

                    $scope.$sce = $sce;

                    $scope.$on('calendar.refreshView', function () {
                        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay, $scope.list);
                    });
                    $scope.onEventClick = function (eventCell, dayClickedFirstRun, $event) {
                        $rootScope.openModalCalendar(eventCell, 'calendar-modal', 'lg', 'static');
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
