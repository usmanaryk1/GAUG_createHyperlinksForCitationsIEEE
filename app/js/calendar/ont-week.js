angular
        .module('mwl.calendar')
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", "$rootScope", function($scope, $sce, moment, calendarHelper, calendarConfig, $rootScope) {

                    $scope.$sce = $sce;

                    $scope.$on('calendar.refreshView', function () {
                        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay, $scope.list);
                        console.log($scope.view);
                    });

                    $scope.onEventClick = function (eventCell, dayClickedFirstRun, $event) {
                        $rootScope.openModalCalendar(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
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
                    onLinkClick: '=',
                    list:'=',
                    totalItems:'=',
                    currentPage:'='
                },
                controller: controller
            };

        });
