angular
        .module('mwl.calendar')
        .directive('mwlCalendarMonth', function () {

            var controller = ["$scope", "moment", "calendarHelper", "calendarConfig", "$rootScope", function ($scope, moment, calendarHelper, calendarConfig, $rootScope) {

                    $scope.calendarConfig = calendarConfig;
                    $scope.openRowIndex = null;

                    $scope.$on('calendar.refreshView', function () {

                        $scope.weekDays = calendarHelper.getWeekDayNames();
                        $scope.view = calendarHelper.getMonthView($scope.events, $scope.currentDay, $scope.typeId, $scope.type);
                        var rows = Math.floor($scope.view.length / 7);
                        $scope.monthOffsets = [];
                        for (var i = 0; i < rows; i++) {
                            $scope.monthOffsets.push(i * 7);
                        }

                    });

                    $scope.onEventClick = function (calendarEvent, eventCell, dayClickedFirstRun, $event) {
                        $rootScope.openModalCalendar(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
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
                    cellEventsTemplateUrl: '@',
                    typeId: '=',
                    type: '='
                },
                controller: controller
            };

        });