(function() {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, PatientDAO, $filter, $state) {
        var ctrl = this;
        ctrl.todaysDate = new Date();
        ctrl.resetManualPunch = function() {
            ctrl.currentTime = $filter('date')(new Date().getTime(), 'hh:mm:ss a').toString();
            ctrl.attendanceObj = {punchInTime: ctrl.currentTime, punchOutTime: ctrl.currentTime};
        };
        ctrl.resetManualPunch();
        ctrl.retrieveEmployees = retrieveEmployeesData;
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            if ($state.current.name.indexOf('patient') > 0) {
                var id = $state.params.id;
                ctrl.attendanceObj.patientId = Number(id);
            }
            if ($state.current.name.indexOf('employee') > 0) {
                var id = $state.params.id;
                ctrl.attendanceObj.employeeId = Number(id);
            }
        }

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll({subAction: 'active'}).then(function(res) {
                ctrl.employeeList = res;
            }).catch(function(data, status) {
                ctrl.employeeList = ontimetest.employees;
            });
        }
        ;
        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveAll({status: 'active'}).then(function(res) {
                ctrl.patientList = res;
            }).catch(function(data, status) {
                ctrl.patientList = ontimetest.patients;
            });
        }
        ;
        ctrl.saveManualAttendance = function() {
            if ($("#manual_punch_form")[0].checkValidity()) {
                $rootScope.maskLoading();
                console.log(JSON.stringify(ctrl.attendanceObj));
                TimesheetDAO.addPunchRecord(ctrl.attendanceObj).then(function() {
                    toastr.success("Manual punch saved.");
                    ctrl.resetManualPunch();
                }).catch(function() {
                    toastr.error("Manual punch cannot be saved.");
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "PatientDAO", "$filter", "$state", ManualPunchCtrl]);
})();