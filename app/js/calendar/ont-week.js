angular
        .module('mwl.calendar')
	  .directive('mwlCalendarWeek', function() {

	  	var controller =  ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", "$rootScope", function($scope, $sce, moment, calendarHelper, calendarConfig, $rootScope) {

                    $scope.$sce = $sce;

                    $scope.$on('calendar.refreshView', function () {
                        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay, $scope.list);
                    });

                    $scope.onEventClick = function (eventCell, dayClickedFirstRun, $event) {
                        $rootScope.openModalCalendar(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
                    };

                    $scope.toggleEvent = function (e) {
                        $(e.currentTarget).next().popover('show');
                        $(e.currentTarget).popover({
                                content: $(e.currentTarget).next().contents(),
                                html: true
                        })
                    }

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
