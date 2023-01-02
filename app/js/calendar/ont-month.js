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
                    $scope.eventClickCalled = false;
                    $scope.onEventClick = function (calendarEvent, eventCell, dayClickedFirstRun, $event) {
                        $scope.eventClickCalled = true;
                        $rootScope.openModalCalendar1(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
                    };
                    $scope.dayClicked = function (date) {
                        if (!$scope.eventClickCalled) {
                            var eventCell;
                            var day = new Date(date.date);
                            var day1 = moment(day);
                            var diff = moment().diff(day1, 'days');
                            if (diff <= 0) {
                                eventCell = {startDate: day};
                            } else {
                                eventCell = {startDate: day, askPassword: true};
                            }
                            if (eventCell) {
                                $rootScope.openModalCalendar1(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
                            }
                        } else {
                            $scope.eventClickCalled = false;
                        }
                    };

                    $scope.toggleEvent = function (e) {
                        $scope.eventClickCalled = true;
                        $(e.currentTarget).next().popover('show');
                        $(e.currentTarget).popover({
                            content: $(e.currentTarget).next().contents(),
                            html: true
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
                    cellTemplateUrl: '@',
                    cellEventsTemplateUrl: '@',
                    typeId: '=',
                    type: '='
                },
                controller: controller
            };

        });