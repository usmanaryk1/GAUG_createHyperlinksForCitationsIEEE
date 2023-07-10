(function () {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, PatientDAO, $filter, $state, $location, $timeout, TasksDAO) {
        var ctrl = this;
        ctrl.taskList = [];
        var searchParams = $location.search();
        ctrl.todaysDate = new Date();
        var timeFormat = 'hh:mm:ss a';
        ctrl.editTimesheet = null;
        ctrl.patientMandatory = true;
        ctrl.resetManualPunch = function () {
            ctrl.currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
            if (ctrl.editTimesheet) {
                ctrl.attendanceObj.isMissedPunch = false;
                ctrl.attendanceObj.punchInTime = ctrl.currentTime;
                ctrl.attendanceObj.punchOutTime = ctrl.currentTime;
                ctrl.attendanceObj.punchInDate = null;
            } else {
                ctrl.attendanceObj = {punchInTime: ctrl.currentTime, punchOutTime: ctrl.currentTime, isMissedPunch: false, isManualPunch: true};
                $("#sboxit-2").select2("val", null);
                $("#sboxit-1").select2("val", null);
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
                ctrl.retrieveEmployee();
                $timeout(function () {
                    $("#sboxit-2").select2("val", ctrl.attendanceObj.employeeId);
                });
            }
            if (ctrl.attendanceObj.patientId != null) {
                ctrl.attendanceObj.patientId = ctrl.attendanceObj.patientId.id;
                $timeout(function () {
                    $("#sboxit-1").select2("val", ctrl.attendanceObj.patientId);
                });

            }
            ctrl.attendanceObj.punchInDate = angular.copy(ctrl.attendanceObj.punchInTime);
            if (ctrl.attendanceObj.punchInTime != null) {
                ctrl.attendanceObj.punchInTime = $filter('date')(new Date(ctrl.attendanceObj.punchInTime).getTime(), timeFormat).toString();
            }
            if (ctrl.attendanceObj.punchOutTime != null) {
                ctrl.attendanceObj.punchOutTime = $filter('date')(new Date(ctrl.attendanceObj.punchOutTime).getTime(), timeFormat).toString();
            }
        }

        var initPage = function () {
            if ($state.params.id && $state.params.id !== '') {
                if (isNaN(parseFloat($state.params.id))) {
                    $state.transitionTo(ontimetest.defaultState);
                }
                var id = $state.params.id;
                if ($state.current.name.indexOf('patient') > 0) {
                    ctrl.attendanceObj.patientId = Number(id);
                    $timeout(function () {
                        $("#sboxit-1").select2("val", ctrl.attendanceObj.patientId);
                    });
                } else if ($state.current.name.indexOf('employee') > 0) {
                    ctrl.attendanceObj.employeeId = Number(id);
                    ctrl.retrieveEmployee();
                    $timeout(function () {
                        $("#sboxit-2").select2("val", ctrl.attendanceObj.employeeId);
                    });
                } else {
                    ctrl.editTimesheet = true;
                    if ($state.current.name.indexOf('edit_missed_punch') > 0) {
                        TimesheetDAO.getMissedPunch({id: id}).then(function (res) {
                            ctrl.attendanceObj = res;
                            $timeout(function () {
                                $('#tasks').multiSelect('refresh');
                            }, 100);
                            ctrl.attendanceObj.isMissedPunch = true;
                            setAttendanceForEdit();
                        });
                    } else if ($state.current.name.indexOf('edit_timesheet') > 0) {
                        TimesheetDAO.get({id: id}).then(function (res) {
                            ctrl.attendanceObj = res;
                            $timeout(function () {
                                $('#tasks').multiSelect('refresh');
                            }, 100);
                            ctrl.attendanceObj.isMissedPunch = false;
                            setAttendanceForEdit();
                        });
                    }
                }
            } else {
                ctrl.editTimesheet = false;
                ctrl.attendanceObj.isManualPunch = true;
            }
        };

        ctrl.retrieveEmployee = function (reset) {
            ctrl.patientMandatory = true;
            EmployeeDAO.get({id: ctrl.attendanceObj.employeeId, includeTasks: true}).then(function (res) {
                ctrl.taskList = res.companyTasks;
                if (reset) {
                    ctrl.attendanceObj.companyTaskIds = [];
                }
                $timeout(function () {
                    $('#tasks').multiSelect('refresh');
                }, 100);
                if (res.position === 'a' || res.position === 'mr') {
                    ctrl.patientMandatory = false;
                }
            });
        }

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            $rootScope.maskLoading();
            EmployeeDAO.retrieveByPosition({}).then(function (res) {
                ctrl.employeeList = res;
            }).catch(function (data, status) {
                ctrl.employeeList = ontimetest.employees;
            }).then(function () {
                $rootScope.unmaskLoading();
                retrievePatientsData();
            });
        }

        function retrievePatientsData() {
            $rootScope.maskLoading();
            PatientDAO.retrieveForSelect({}).then(function (res) {
                ctrl.patientList = res;
            }).catch(function (data, status) {
                ctrl.patientList = ontimetest.patients;
            }).then(function () {
                $rootScope.unmaskLoading();
                initPage();
            });
        }
        ;

        var mergeDateAndTime = function (date, time) {
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
            return $filter('date')(date, ontimetest.date_time_format);
        };

//        var verifyTimeValidation=function(){
//            var punchInTime=mergeDateAndTime(ctrl.attendanceObj.punchInDate,ctrl.attendanceObj.punchInTime);
//            var punchOutTime=mergeDateAndTime(ctrl.attendanceObj.punchInDate,ctrl.attendanceObj.punchOutTime);
//            if(punchInTime.getTime()<)
//            
//        };

        ctrl.navigateToState = function () {
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
        ctrl.saveManualAttendance = function () {
            ctrl.formSubmitted = true;
            if ($("#manual_punch_form")[0].checkValidity() && (ctrl.attendanceObj.patientId != null || !ctrl.patientMandatory) && ctrl.attendanceObj.employeeId != null) {
                $rootScope.maskLoading();
                var attendanceObjToSave = angular.copy(ctrl.attendanceObj);
                if (attendanceObjToSave.isMissedPunch === false) {
                    delete attendanceObjToSave.isMissedPunch;
                    if (attendanceObjToSave.id == null) {
                        console.log(JSON.stringify(attendanceObjToSave));
                        TimesheetDAO.addPunchRecord(attendanceObjToSave).then(function () {
                            toastr.success("Manual punch saved.");
                            ctrl.resetManualPunch();
                            ctrl.formSubmitted = false;
                        }).catch(function (e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Manual punch cannot be saved.");
                            }
                        }).then(function () {
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
                        TimesheetDAO.update(attendanceObjToSave).then(function () {
                            toastr.success("Timesheet saved.");
                            ctrl.navigateToState();
                            ctrl.formSubmitted = false;
//                        ctrl.resetManualPunch();
                        }).catch(function (e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Timesheet cannot be saved.");
                            }
                        }).then(function () {
                            $rootScope.unmaskLoading();
                        });
                    }
                } else {
                    if (attendanceObjToSave.id == null) {
                        delete attendanceObjToSave.isMissedPunch;
                        console.log(JSON.stringify(attendanceObjToSave));
                        TimesheetDAO.addMissedPunchRecord(attendanceObjToSave).then(function () {
                            toastr.success("Manual punch saved.");
                            ctrl.resetManualPunch();
                            ctrl.formSubmitted = false;
                        }).catch(function (e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Manual punch cannot be saved.");
                            }
                        }).then(function () {
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
                        TimesheetDAO.updateMissedPunch(attendanceObjToSave).then(function () {
                            toastr.success("Timesheet saved.");
                            ctrl.navigateToState();
                            ctrl.formSubmitted = false;
//                        ctrl.resetManualPunch();
                        }).catch(function (e) {
                            if (e.data != null) {
                                toastr.error(e.data);
                            } else {
                                toastr.error("Timesheet cannot be saved.");
                            }
                        }).then(function () {
                            $rootScope.unmaskLoading();
                        });
                    }
                }
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "PatientDAO", "$filter", "$state", "$location", "$timeout", "TasksDAO", ManualPunchCtrl]);
})();