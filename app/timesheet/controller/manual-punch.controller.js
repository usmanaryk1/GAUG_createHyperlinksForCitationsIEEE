(function() {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, PatientDAO, $filter, $state, $location) {
        var ctrl = this;
        var searchParams = $location.search();
        ctrl.todaysDate = new Date();
        var timeFormat = 'hh:mm:ss a';
        ctrl.editTimesheet = null;
        ctrl.resetManualPunch = function() {
            ctrl.currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
            if (ctrl.editTimesheet) {
                ctrl.attendanceObj.isMissedPunch = false;
                ctrl.attendanceObj.punchInTime = ctrl.currentTime;
                ctrl.attendanceObj.punchOutTime = ctrl.currentTime;
                ctrl.attendanceObj.punchInDate = null;
            } else {
                ctrl.attendanceObj = {punchInTime: ctrl.currentTime, punchOutTime: ctrl.currentTime, isMissedPunch: false};
            }
        };
        ctrl.resetManualPunch();
        ctrl.retrieveEmployees = retrieveEmployeesData;

        //once you retrieve data for edit
        function setAttendanceForEdit() {
            ctrl.empObj = angular.copy(ctrl.attendanceObj.employeeId);
            ctrl.patientObj = angular.copy(ctrl.attendanceObj.patientId);

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
        }

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
                ctrl.editTimesheet = true;
                if ($state.current.name.indexOf('edit_missed_punch') > 0) {
                    TimesheetDAO.getMissedPunch({id: id}).then(function(res) {
                        ctrl.attendanceObj = res;
                        ctrl.attendanceObj.isMissedPunch = true;
                        setAttendanceForEdit();
                    });
                } else if ($state.current.name.indexOf('edit_timesheet') > 0) {
                    TimesheetDAO.get({id: id}).then(function(res) {
                        ctrl.attendanceObj = res;
                        ctrl.attendanceObj.isMissedPunch = false;
                        setAttendanceForEdit();
                    });
                }
            }
        } else {
            ctrl.editTimesheet = false;
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

        var mergeDateAndTime = function(date, time) {
            date = new Date(date);
            var hours = Number(time.match(/^(\d+)/)[1]);
            var minutes = Number(time.match(/:(\d+)/)[1]);
            var seconds = time.substr(time.lastIndexOf(":") + 1, 2);
            var AMPM = time.match(/\s(.*)$/)[1];
            if ((AMPM == "PM" || AMPM == "Pm") && hours < 12)
                hours = hours + 12;
            if ((AMPM == "AM" || AMPM == "Am") && hours == 12)
                hours = hours - 12;
            date.setHours(hours, minutes, seconds);
            return date;
        };

//        var verifyTimeValidation=function(){
//            var punchInTime=mergeDateAndTime(ctrl.attendanceObj.punchInDate,ctrl.attendanceObj.punchInTime);
//            var punchOutTime=mergeDateAndTime(ctrl.attendanceObj.punchInDate,ctrl.attendanceObj.punchOutTime);
//            if(punchInTime.getTime()<)
//            
//        };

        ctrl.navigateToState = function() {
            var params = angular.copy(searchParams);
            if (searchParams != null) {
                if (searchParams.empId != null) {
                    params.id = params.empId;
                    $state.go('app.employee_timesheet', params);
                } else if (searchParams.patId != null) {
                    params.id = params.patId;
                    $state.go('app.patient_time_sheet', params);
                } else if (searchParams.cordinatorId != null) {
                    params.id = params.cordinatorId;
                    $state.go('app.daily_attendance', params);
                }
            }

        };
        ctrl.saveManualAttendance = function() {

            if ($("#manual_punch_form")[0].checkValidity()) {
                $rootScope.maskLoading();
                var attendanceObjToSave = angular.copy(ctrl.attendanceObj);
                if (attendanceObjToSave.isMissedPunch === false) {
                    delete attendanceObjToSave.isMissedPunch;
                    if (attendanceObjToSave.id == null) {
                        console.log(JSON.stringify(attendanceObjToSave));
                        TimesheetDAO.addPunchRecord(attendanceObjToSave).then(function() {
                            toastr.success("Manual punch saved.");
                            ctrl.resetManualPunch();
                        }).catch(function(e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Manual punch cannot be saved.");
                            }
                        }).then(function() {
                            $rootScope.unmaskLoading();
                        });
                    } else {
                        delete attendanceObjToSave.isMissedPunch;
                        attendanceObjToSave.punchInTime = mergeDateAndTime(ctrl.attendanceObj.punchInDate, ctrl.attendanceObj.punchInTime);
                        attendanceObjToSave.punchOutTime = mergeDateAndTime(ctrl.attendanceObj.punchInDate, ctrl.attendanceObj.punchOutTime);
                        if (attendanceObjToSave.employeeId != null) {
                            attendanceObjToSave.employeeId = {id: ctrl.attendanceObj.employeeId};
                        }
                        if (attendanceObjToSave.patientId != null) {
                            attendanceObjToSave.patientId = {id: ctrl.attendanceObj.patientId};
                        }
                        TimesheetDAO.update(attendanceObjToSave).then(function() {
                            toastr.success("Timesheet saved.");
                            ctrl.navigateToState();

//                        ctrl.resetManualPunch();
                        }).catch(function(e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Timesheet cannot be saved.");
                            }
                        }).then(function() {
                            $rootScope.unmaskLoading();
                        });
                    }
                } else {
                    if (attendanceObjToSave.id == null) {
                        delete attendanceObjToSave.isMissedPunch;
                        console.log(JSON.stringify(attendanceObjToSave));
                        TimesheetDAO.addMissedPunchRecord(attendanceObjToSave).then(function() {
                            toastr.success("Manual punch saved.");
                            ctrl.resetManualPunch();
                        }).catch(function(e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Manual punch cannot be saved.");
                            }
                        }).then(function() {
                            $rootScope.unmaskLoading();
                        });
                    } else {
                        delete attendanceObjToSave.isMissedPunch;
                        attendanceObjToSave.punchInTime = mergeDateAndTime(ctrl.attendanceObj.punchInDate, ctrl.attendanceObj.punchInTime);
                        attendanceObjToSave.punchOutTime = mergeDateAndTime(ctrl.attendanceObj.punchInDate, ctrl.attendanceObj.punchOutTime);
                        if (attendanceObjToSave.employeeId != null) {
                            attendanceObjToSave.employeeId = {id: ctrl.attendanceObj.employeeId};
                        }
                        if (attendanceObjToSave.patientId != null) {
                            attendanceObjToSave.patientId = {id: ctrl.attendanceObj.patientId};
                        }
                        TimesheetDAO.updateMissedPunch(attendanceObjToSave).then(function() {
                            toastr.success("Timesheet saved.");
                            ctrl.navigateToState();

//                        ctrl.resetManualPunch();
                        }).catch(function(e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Timesheet cannot be saved.");
                            }
                        }).then(function() {
                            $rootScope.unmaskLoading();
                        });
                    }
                }
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "PatientDAO", "$filter", "$state", "$location", ManualPunchCtrl]);
})();