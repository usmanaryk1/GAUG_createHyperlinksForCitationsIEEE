(function () {
    function CalendarCtrl(Page, EmployeeDAO, $rootScope, PositionDAO, $debounce) {
        var ctrl = this;
        
        ctrl.employee_list = [];

        Page.setTitle("Calendar");

        ctrl.calendarView = 'month';
        ctrl.isOpen = false;
        ctrl.calendarDay = new Date();

        ctrl.changeToMonth = function () {
            ctrl.calendarView = 'month';
        }

        ctrl.showDatepicker = function () {
            if (ctrl.isOpen) {
                ctrl.isOpen = false;
            } else {
                ctrl.isOpen = true;
            }
        }

        ctrl.changeToWeek = function () {
            ctrl.calendarView = 'week';
        }
        ctrl.searchParams = {skip: 0, limit: 10};
        ctrl.pageChanged = function (pagenumber) {
            ctrl.pageNo = pagenumber;
            ctrl.retrieveEmployees();
        };

        ctrl.applySearch = function () {
            ctrl.pageNo = 1;
            $debounce(ctrl.retrieveEmployees, 500);
        };
        ctrl.retrieveEmployees = function () {
            if (ctrl.pageNo > 1) {
                ctrl.searchParams.skip = ctrl.pageNo * ctrl.searchParams.limit;
            } else {
                ctrl.searchParams.skip = 0;
            }
            EmployeeDAO.getEmployeesForSchedule(ctrl.searchParams).then(function (res) {
                ctrl.employee_list = res;
                ctrl.totalRecords = $rootScope.totalRecords;
            });
        };
        ctrl.retrieveAllEmployees = function () {
            EmployeeDAO.retrieveAll({subAction: 'all'}).then(function (res) {
                ctrl.employeeList = res;
            });
        };
        ctrl.retrieveAllPositions = function () {
            PositionDAO.retrieveAll({}).then(function (res) {
                ctrl.positions = res;
            });
        };
        ctrl.retrieveEmployees();
        ctrl.retrieveAllEmployees();
        ctrl.retrieveAllPositions();
    }

    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", "EmployeeDAO", "$rootScope", "PositionDAO", "$debounce", CalendarCtrl]);
})();
