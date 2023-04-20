(function() {
    function DailyAttendanceCtrl($timeout, $rootScope, TimesheetDAO, EmployeeDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            ctrl.selectEmployee(ctrl.employeeList[0]);
            ctrl.filterTimesheet();
        };
        ctrl.rerenderDataTable = function() {
//            ctrl.datatableObj = {};
//            var attendanceList = angular.copy(ctrl.attendanceList);
//            ctrl.attendanceList = [];
//            $("#example-1_wrapper").remove();
//            $timeout(function() {
//                ctrl.attendanceList = attendanceList;
//            });
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchParams.startDate === "") {
                ctrl.searchParams.startDate = null;
            }
            if (ctrl.searchParams.endDate === "") {
                ctrl.searchParams.endDate = null;
            }
            ctrl.retrieveTimesheet();
            ctrl.datatableObj.fnDraw();
        }
        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveByPosition({'position':'a'}).then(function(res) {
                ctrl.employeeList = res;
            }).catch(function(data, status) {
                toastr.error("Could not load Coordinators");
//                ctrl.employeeList = ontimetest.employees;
            });
        }
        
        ctrl.retrieveTimesheet = function() {
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            TimesheetDAO.retrieveAllDailyAttendance(ctrl.searchParams).then(function(res) {
                ctrl.attendanceList = res;
                ctrl.rerenderDataTable();
            }).catch(function() {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
                toastr.error("Could not load Daily Attendance");
            }).then(function() {
                $rootScope.unmaskLoading();
            });

        };


    }
    ;
    angular.module('xenon.controllers').controller('DailyAttendanceCtrl', ["$timeout", "$rootScope", "TimesheetDAO", "EmployeeDAO", DailyAttendanceCtrl]);
})();