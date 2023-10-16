(function () {
    function CalendarCtrl(Page, EmployeeDAO, $rootScope, PositionDAO, $debounce) {
        var ctrl = this;
        ctrl.hours = [];

        Page.setTitle("Calendar");

        this.calendarView = 'month';
        this.isOpen = false;
        this.calendarDay = new Date();

        this.changeToMonth = function () {
            this.calendarView = 'month';
        }

        this.showDatepicker = function () {
            console.log(this.isOpen);
            if (this.isOpen) {
                this.isOpen = false;
            } else {
                this.isOpen = true;
            }
        }

        this.changeToWeek = function () {
            this.calendarView = 'week';
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
                ctrl.hours = res;
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

//        ctrl.hours = [{'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}, {'name': 'Jayesh'}, {'name': 'Yash'}]
    }

    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", "EmployeeDAO", "$rootScope", "PositionDAO", "$debounce", CalendarCtrl]);
})();
