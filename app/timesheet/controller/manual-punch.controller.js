(function() {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO) {
        var ctrl = this;
        ctrl.attendanceObj = {punchInTime: "11:25:00 Am", punchOutTime: "11:25:00 Am"};

        ctrl.retrieveEmployees = retrieveEmployeesData;
        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll().then(function(res) {
                ctrl.employeeList = res;
            }).catch(function(data, status) {
                ctrl.employeeList = ontimetest.employees;
            });
        }
        ;
        ctrl.saveManualAttendance = function() {
            if ($("#manual_punch_form")[0].checkValidity()) {
                console.log(JSON.stringify(ctrl.attendanceObj));
                TimesheetDAO.addPunchRecord(ctrl.attendanceObj).then(function() {
                    
                });
            }

        };
    }
    ;
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", ManualPunchCtrl]);
})();