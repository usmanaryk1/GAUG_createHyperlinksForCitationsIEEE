angular
        .module('mwl.calendar')
        .directive('mwlCalendarWeek', function () {

            var controller = ["$scope", "$sce", "moment", "calendarHelper", "calendarConfig", "$rootScope", function ($scope, $sce, moment, calendarHelper, calendarConfig, $rootScope) {
                    $scope.$sce = $sce;

                    $scope.$on('calendar.refreshView', function () {
                        $scope.view = calendarHelper.getWeekView($scope.events, $scope.currentDay, $scope.list, $scope.type);
                    });

                    $scope.eventClickCalled = false;
                    $scope.onEventClick = function (eventCell, object, onClickDate) {
                        if (!eventCell) {
                            if (!$scope.eventClickCalled) {
                                var day = new Date(onClickDate.date);
                                var day1 = moment(day);
                                var diff = moment().diff(day1, 'days');
                                if (diff <= 0) {
                                    eventCell = {data: object, startDate: day};
                                }
                            } else {
                                $scope.eventClickCalled = false;
                            }
                        } else {
                            $scope.eventClickCalled = true;
                        }
                        if (eventCell) {
                            $rootScope.openModalCalendar(angular.copy(eventCell), 'calendar-modal', 'lg', 'static');
                        }
                    };

                    $scope.onLinkClick = function (obj) {
                        $rootScope.navigateToMonthPage(angular.copy(obj));
                    };
                    $scope.onViewInfoClick = function (obj) {
                        $rootScope.openEditModal(angular.copy(obj), 'modal-5');
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
                    list: '=',
                    type: '='
                },
                controller: controller
            };

        });
