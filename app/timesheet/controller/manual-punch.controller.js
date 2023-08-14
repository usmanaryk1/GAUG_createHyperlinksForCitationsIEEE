(function () {
    function ManualPunchCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, PatientDAO, $filter, $state, $location, $timeout, $modal, Page) {
        var ctrl = this;
        Page.setTitle("Manual Punch");
        ctrl.taskList = [];
        ctrl.taskOptionsMap = {};
        var searchParams = $location.search();
        ctrl.todaysDate = new Date();
        var timeFormat = 'hh:mm:ss a';
        ctrl.editTimesheet = null;
        ctrl.patientMandatory = true;
        ctrl.tasksErrorMsg = null;
        ctrl.selectedPosition = '';
        ctrl.resetManualPunch = function () {
            ctrl.currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
            if (ctrl.editTimesheet) {
                ctrl.attendanceObj.isMissedPunch = false;
                ctrl.attendanceObj.punchInTime = ctrl.currentTime;
                ctrl.attendanceObj.punchOutTime = ctrl.currentTime;
                ctrl.attendanceObj.punchInDate = null;
                ctrl.attendanceObj.companyTaskIds = [];
                ctrl.attendanceObj.taskIdValues = {};
            } else {
                ctrl.attendanceObj = {
                    punchInTime: ctrl.currentTime,
                    punchOutTime: ctrl.currentTime,
                    isMissedPunch: false,
                    isManualPunch: true,
                    companyTaskIds: [],
                    taskIdValues: {}
                };
                ctrl.taskList = [];

                $("#sboxit-2").select2("val", null);
                $("#sboxit-1").select2("val", null);
            }
            $timeout(function () {
                $('#tasks').multiSelect('refresh');
            }, 100);
        };
        ctrl.resetManualPunch();
        ctrl.retrieveEmployees = retrieveEmployeesData;

        //once you retrieve data for edit
        function setAttendanceForEdit() {
            ctrl.attendanceObj.taskIdValues = {};
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
                ctrl.taskOptionsMap = {};
                angular.forEach(ctrl.taskList, function (obj) {
                    if (obj.options && obj.options !== null) {
                        ctrl.taskOptionsMap[obj.id] = obj.options.split("|");
                    }
                })
                if (reset) {
                    ctrl.attendanceObj.companyTaskIds = [];
                }
                ctrl.attendanceObj.taskIdValues = {};
                ctrl.selectedPosition = res.position;
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
            if (ctrl.attendanceObj.employeeId && ctrl.attendanceObj.employeeId !== null) {
                if (ctrl.attendanceObj.employeeId.position === 'pc') {
                    if (ctrl.attendanceObj.companyTaskIds.length < 5 && ctrl.attendanceObj.companyTaskIds.length !== ctrl.taskList.length) {
                        ctrl.tasksErrorMsg = 'Please select atleast 5 tasks.';
                    } else {
                        ctrl.tasksErrorMsg = null;
                    }
                } else {
                    if (ctrl.attendanceObj.companyTaskIds.length < 1 && ctrl.attendanceObj.companyTaskIds.length !== ctrl.taskList.length) {
                        ctrl.tasksErrorMsg = 'Please select atleast one task.';
                    } else {
                        ctrl.tasksErrorMsg = null;
                    }
                }
            } else {
                ctrl.tasksErrorMsg = null;
            }
            if ($("#manual_punch_form")[0].checkValidity() &&
                    (ctrl.attendanceObj.patientId != null || !ctrl.patientMandatory) &&
                    ctrl.attendanceObj.employeeId != null && ctrl.tasksErrorMsg == null) {
                $rootScope.maskLoading();
                var attendanceObjToSave = angular.copy(ctrl.attendanceObj);
                if (attendanceObjToSave.isMissedPunch === false) {
                    delete attendanceObjToSave.isMissedPunch;
                    if (attendanceObjToSave.id == null) {
                        //to add new record we have to send this json as string
                        attendanceObjToSave.taskIdValues = JSON.stringify(attendanceObjToSave.taskIdValues);
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
                        //to update we have to send this in tasks list of timesheet/missed_punch object
                        attendanceObjToSave.tasks = [];
                        for (var key in attendanceObjToSave.taskIdValues) {
                            var newTask = {};
                            newTask.companyTasksId = {id: key};
                            newTask.value = attendanceObjToSave.taskIdValues[key];
                            attendanceObjToSave.tasks.push(newTask);
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
                        //to add new record we have to send this json as string
                        attendanceObjToSave.taskIdValues = JSON.stringify(attendanceObjToSave.taskIdValues);
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
                        //to update we have to send this in tasks list of timesheet/missed_punch object
                        attendanceObjToSave.tasks = [];
                        for (var key in attendanceObjToSave.taskIdValues) {
                            var newTask = {};
                            newTask.companyTasksId = {id: key};
                            newTask.value = attendanceObjToSave.taskIdValues[key];
                            attendanceObjToSave.tasks.push(newTask);
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


// Open Simple Modal
        ctrl.openModal = function (modal_id, modal_size, modal_backdrop, optionArr)
        {
            ctrl.selecteModalOpen = true;
            $rootScope.taskModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.taskModal.answerOptions = optionArr;
            $rootScope.taskModal.taskValue = optionArr[0];
            $rootScope.taskModal.save = function () {
                $timeout(function () {
                    if ($('#taskForm')[0].checkValidity()) {
                        ctrl.attendanceObj.taskIdValues[ctrl.newSelectedTaskId] = $rootScope.taskModal.taskValue;
                        $rootScope.taskModal.dismiss();
                    }
                    ctrl.selecteModalOpen = false;
                });
            };

            $rootScope.taskModal.cancel = function () {
                ctrl.attendanceObj.companyTaskIds.splice(ctrl.attendanceObj.companyTaskIds.indexOf(ctrl.newSelectedTaskId), 1);
                $timeout(function () {
                    $("#tasks").multiSelect('refresh');
                });
                $rootScope.taskModal.close();
            };

        };

        $scope.$watch(function () {
            return ctrl.attendanceObj.companyTaskIds;
        }, function (newValue, oldValue) {
            $timeout(function () {
                $("#tasks").multiSelect('refresh');
            });
            if (newValue !== null && (oldValue === null || newValue.length > oldValue.length)) {
                if (oldValue === null) {
                    ctrl.newSelectedTaskId = newValue;
                } else {
                    ctrl.newSelectedTaskId = arr_diff(newValue, oldValue);
                }
                if (ctrl.taskOptionsMap[ctrl.newSelectedTaskId]) {
                    ctrl.openModal('modal-5', 'sm', 'static', ctrl.taskOptionsMap[ctrl.newSelectedTaskId]);
                }

            }
        }, true);
    }
    angular.module('xenon.controllers').controller('ManualPunchCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "PatientDAO", "$filter", "$state", "$location", "$timeout", "$modal", "Page", ManualPunchCtrl]);
})();