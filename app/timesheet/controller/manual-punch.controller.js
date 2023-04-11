(function() {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, PatientDAO, $filter, $state) {
        var ctrl = this;
        ctrl.todaysDate = new Date();
        var timeFormat = 'hh:mm:ss a';
        ctrl.resetManualPunch = function() {
            ctrl.currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
            ctrl.attendanceObj = {punchInTime: ctrl.currentTime, punchOutTime: ctrl.currentTime};
        };
        ctrl.resetManualPunch();
        ctrl.retrieveEmployees = retrieveEmployeesData;
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            var id = $state.params.id;
            if ($state.current.name.indexOf('patient') > 0) {
                ctrl.attendanceObj.patientId = Number(id);
            } else if ($state.current.name.indexOf('employee') > 0) {
                ctrl.attendanceObj.employeeId = Number(id);
            } else {
                TimesheetDAO.get({id: id}).then(function(res) {
                    ctrl.attendanceObj = res;
                    if (ctrl.attendanceObj.employeeId != null) {
                        ctrl.attendanceObj.employeeId = ctrl.attendanceObj.employeeId.id;
                    }
                    if (ctrl.attendanceObj.patientId != null) {
                        ctrl.attendanceObj.patientId = ctrl.attendanceObj.patientId.id;
                    }
                    ctrl.attendanceObj.punchInDate = angular.copy(ctrl.attendanceObj.punchInTime);
                    if (ctrl.attendanceObj.punchInTime != null) {
                        ctrl.attendanceObj.punchInTime = $filter('date')(new Date(ctrl.attendanceObj.punchInTime).getTime(), timeFormat).toString();
                    }
                    if (ctrl.attendanceObj.punchOutTime != null) {
                        ctrl.attendanceObj.punchOutTime = $filter('date')(new Date(ctrl.attendanceObj.punchOutTime).getTime(), timeFormat).toString();
                    }

                });
            }
        }

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveByPosition({}).then(function(res) {
                ctrl.employeeList = res;
            }).catch(function(data, status) {
                ctrl.employeeList = ontimetest.employees;
            });
        }
        ;
        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveForSelect({}).then(function(res) {
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
                if (ctrl.attendanceObj.id == null) {
                    TimesheetDAO.addPunchRecord(ctrl.attendanceObj).then(function() {
                        toastr.success("Manual punch saved.");
                        ctrl.resetManualPunch();
                    }).catch(function() {
                        toastr.error("Manual punch cannot be saved.");
                    }).then(function() {
                        $rootScope.unmaskLoading();
                    });
                } else {
                    TimesheetDAO.update(ctrl.attendanceObj).then(function() {
                        toastr.success("Manual punch saved.");
//                        ctrl.resetManualPunch();
                    }).catch(function() {
                        toastr.error("Manual punch cannot be saved.");
                    }).then(function() {
                        $rootScope.unmaskLoading();
                    });
                }
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "PatientDAO", "$filter", "$state", ManualPunchCtrl]);
})();