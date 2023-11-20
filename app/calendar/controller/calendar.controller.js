(function () {
    function CalendarCtrl(Page, EmployeeDAO, $rootScope, PositionDAO, $debounce, PatientDAO, EventTypeDAO, $modal, $filter, $timeout, $state, $stateParams) {
        var ctrl = this;

        ctrl.employee_list = [];
        $rootScope.selectEmployeeModel = {};
        ctrl.viewEmployee;

        var timeFormat = 'HH:mm';

        Page.setTitle("Employee Calendar");

        ctrl.calendarView = 'week';

        if ($stateParams.id != '') {
            ctrl.calendarView = 'month';
        }

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

        ctrl.resetFilters = function () {
            ctrl.searchParams = {limit: 10, skip: 0};
            ctrl.searchParams.availableStartDate = null;
            ctrl.searchParams.availableStartDate = null;
            $('#employeeIds').select2('val', null);
            $('#positions').select2('val', null);
            $('#languages').select2('val', null);
            ctrl.applySearch();
        };

        ctrl.retrieveEmployees = function () {
            if (ctrl.pageNo > 1) {
                ctrl.searchParams.skip = (ctrl.pageNo - 1) * ctrl.searchParams.limit;
            } else {
                ctrl.searchParams.skip = 0;
            }
            var searchParams = angular.copy(ctrl.searchParams);
            if (searchParams.employeeIds != null) {
                searchParams.employeeIds = searchParams.employeeIds.toString();
            }
            if (searchParams.positionIds != null) {
                searchParams.positionIds = searchParams.positionIds.toString();
            }
            if (searchParams.languages != null) {
                searchParams.languages = searchParams.languages.toString();
            }
            EmployeeDAO.getEmployeesForSchedule(searchParams).then(function (res) {
                ctrl.employee_list = res;

                if (!ctrl.viewEmployee) {
                    ctrl.viewEmployee = res[0];
                }
                if ($stateParams.id != '') {
                    var obj;
                    angular.forEach(res, function (item) {
                        if (item.id == $stateParams.id) {
                            obj = angular.copy(item);
                        }
                    });
                    if (!obj) {
                        EmployeeDAO.getEmployeesForSchedule({employeeIds: $stateParams.id}).then(function (res1) {
                            ctrl.viewEmployee = angular.copy(res1[0]);
                            ctrl.employeeId = ctrl.viewEmployee.id;
                        });
                    } else {
                        ctrl.viewEmployee = angular.copy(obj);
                    }
                }
                if (ctrl.viewEmployee) {
                    ctrl.employeeId = ctrl.viewEmployee.id;
                }
                delete res.$promise;
                delete res.$resolved;
                /* Fetch all Employee id's to get related events */
                var ids = (_.map(ctrl.employee_list, 'id')).toString();
                if ($stateParams.id != '') {
                    ids = ids + ',' + $stateParams.id;
                }
                ctrl.getAllEvents(ids);
                ctrl.totalRecords = $rootScope.totalRecords;
            });
        };

        ctrl.loadEvents = function () {
            ctrl.pageNo = 0;
            ctrl.searchParams.limit = 10;
            ctrl.retrieveEmployees();
        };

        ctrl.getAllEvents = function (ids) {
            EventTypeDAO.retrieveBySchedule({employeeIds: ids}).then(function (res) {
                delete res.$promise;
                delete res.$resolved;
                ctrl.events = res;
            });
        }

        ctrl.retrieveAllEmployees = function () {
            EmployeeDAO.retrieveAll({subAction: 'active'}).then(function (res) {
                ctrl.employeeList = res;
            });
        };

        ctrl.retrieveAllPositions = function () {
            PositionDAO.retrieveAll({}).then(function (res) {
                ctrl.positions = res;
                ctrl.positionMap = {};
                if (res && res.length > 0) {
                    angular.forEach(res, function (position) {
                        ctrl.positionMap[position.id] = position.position;
                    });
                }
            });
        };

        $rootScope.openModalCalendar = function (data, modal_id, modal_size, modal_backdrop)
        {
            var data;
            var employeeObj;
            var patients;
            function open() {
                $rootScope.unmaskLoading();
                setTimeout(function () {
                    $("#eventEmployeeIds").select2({
                        // minimumResultsForSearch: -1,
                        placeholder: 'Select Employee...',
                        // minimumInputLength: 1,
                        // placeholder: 'Search',
                    }).on('select2-open', function ()
                    {
                        // Adding Custom Scrollbar
                        $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                    });
                }, 200);
                $rootScope.employeePopup = $modal.open({
                    templateUrl: modal_id,
                    size: modal_size,
                    backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                    keyboard: false
                });
                $rootScope.employeePopup.todayDate = new Date();
                $rootScope.employeePopup.calendarView = ctrl.calendarView;
                $rootScope.employeePopup.employeeList = ctrl.employeeList;
                $rootScope.employeePopup.patients = patients;
                $rootScope.employeePopup.reasons = ontimetest.employeeReasons;
                $rootScope.employeePopup.eventTypes = ontimetest.eventTypes;
                $rootScope.employeePopup.recurranceTypes = ontimetest.recurranceTypes;
                $rootScope.employeePopup.employee = angular.copy(employeeObj);

                if (data == null) {
                    $rootScope.employeePopup.isNew = true;
                } else {
                    $rootScope.employeePopup.isNew = false;
                    $rootScope.employeePopup.data = data;
                    if (data.eventType != 'U')
                        $rootScope.employeePopup.data.applyTo = "SINGLE";
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                if (!angular.isDefined($rootScope.employeePopup.data)) {
                    $rootScope.employeePopup.data = {eventType: "A", recurranceType: "N", startTime: currentTime, endTime: currentTime, forLiveIn: false, startDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat)};
                }
                $rootScope.employeePopup.save = function () {
                    $timeout(function () {
                        var name = '#' + "popupemployee" + $rootScope.employeePopup.data.eventType.toLowerCase();
                        if ($(name)[0].checkValidity()) {
                            var a = moment(new Date($rootScope.employeePopup.data.startDate));
                            var b = moment(new Date($rootScope.employeePopup.data.endDate));
                            var diff = b.diff(a, 'days');
                            if (diff > 6) {
                                toastr.error("Date range should be no more of 7 days.");
                            } else {
                                if ($rootScope.employeePopup.data.eventType == 'U') {
                                    var start = new Date($rootScope.employeePopup.data.startDate).getDay();
                                    var end = new Date($rootScope.employeePopup.data.endDate).getDay();
                                    if (end < start) {
                                        toastr.error("Both dates must fall in same week.");
                                    } else {
                                        ctrl.saveEmployeePopupChanges($rootScope.employeePopup.data);
                                    }
                                } else {
                                    ctrl.saveEmployeePopupChanges($rootScope.employeePopup.data);
                                }
                            }
                        } else {
                            console.log("invalid form");
                        }
                    });
                };
                $rootScope.employeePopup.retrievePatientBasedOnCare = function () {
                    delete $rootScope.employeePopup.data.patientId;
                    $rootScope.employeePopup.patients = $rootScope.employeePopup.carePatientMap[$rootScope.employeePopup.data.companyCareTypeId];
                };
                $rootScope.employeePopup.changed = function (form, event) {
                    if (event != 'repeat') {
                        var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                        var old = $rootScope.employeePopup.data.eventType;
                        $rootScope.employeePopup.data = {eventType: old, recurranceType: "N", startDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat)};
                        if (old == 'S') {
                            if (!angular.isDefined($rootScope.employeePopup.data.forLiveIn))
                                $rootScope.employeePopup.data.forLiveIn = false;
                        }
                        if (old != 'U') {
                            $rootScope.employeePopup.data.startTime = currentTime;
                            $rootScope.employeePopup.data.endTime = currentTime;
                        }
                        if (old == 'U') {
                            if (!angular.isDefined($rootScope.employeePopup.data.isPaid))
                                $rootScope.employeePopup.data.isPaid = false;
                        }
                        setTimeout(function () {
                            $("#eventEmployeeIds").select2({
                                // minimumResultsForSearch: -1,
                                placeholder: 'Select Employee...',
                                // minimumInputLength: 1,
                                // placeholder: 'Search',
                            }).on('select2-open', function ()
                            {
                                // Adding Custom Scrollbar
                                $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                            });
                            cbr_replace();
                        }, 200);
                    }
                };
                $rootScope.employeePopup.deleteSchedule = function () {
                    var obj = $rootScope.employeePopup.data;
                    var id;
                    if (obj.availabilityId)
                        id = obj.availabilityId;
                    if (obj.scheduleId)
                        id = obj.scheduleId;
                    if (obj.unavailabilityId)
                        id = obj.unavailabilityId;
                    $rootScope.maskLoading();
                    EventTypeDAO.delete({subAction: id, action: ontimetest.eventTypes[obj.eventType].toLowerCase(), applyTo: obj.applyTo}).then(function (res) {
                        ctrl.retrieveEmployees();
                        toastr.success("Event deleted.");
                        $rootScope.employeePopup.close();
                    }).catch(function (data, status) {
                        toastr.error(data.data);
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }
                $rootScope.employeePopup.employeeChanged = function (empId, editMode, viewMode) {
                    if ($rootScope.employeePopup.data.eventType == 'S' && !editMode) {
                        delete $rootScope.employeePopup.data.companyCareTypeId;
                        delete $rootScope.employeePopup.data.patientId;
                        $rootScope.employeePopup.carePatientMap = {};
                        $rootScope.employeePopup.careTypes = [];
                    }
                    if (!($rootScope.employeePopup.data.eventType != 'S' && !editMode && !viewMode)) {
                        $rootScope.employeePopup.showLoadingImage = true;
                        EmployeeDAO.getEmployeesForSchedule({employeeIds: empId}).then(function (res) {
                            employeeObj = res[0];
                            if (ctrl.calendarView == 'month' || !$rootScope.employeePopup.isNew) {
                                $rootScope.employeePopup.employee = angular.copy(employeeObj);
                            }
                        }).catch(function (data, status) {
                            toastr.error("Failed to retrieve employee.");
                        }).then(function () {

                            function open1() {
                                if ($rootScope.employeePopup.data.eventType == 'S' || viewMode) {
                                    ctrl.careTypeIdMap = {};
                                    var careTypesSelected = [];
                                    if (employeeObj && employeeObj.employeeCareRatesList && employeeObj.employeeCareRatesList.length > 0) {
                                        var length = employeeObj.employeeCareRatesList.length;
                                        carePatientMap = {};
                                        var next = 0;
                                        for (var i = 0; i < length; i++) {
                                            careTypesSelected.push(employeeObj.employeeCareRatesList[i].companyCaretypeId);
                                            var id = employeeObj.employeeCareRatesList[i].companyCaretypeId.id;
                                            PatientDAO.retrieveForCareType({companyCareTypes: id, subAction: "active"}).then(function (res) {
                                                carePatientMap[res.headers.careid] = res.data;
                                                next++;
                                            }).catch(function (data) {
                                                toastr.error(data.data);
                                            }).then(function () {
                                                if (next === (length - 1)) {
                                                    $rootScope.employeePopup.showLoadingImage = false;
                                                    careTypes = careTypesSelected;
                                                    $rootScope.employeePopup.carePatientMap = carePatientMap;
                                                    $rootScope.employeePopup.careTypes = careTypes;
                                                    if (editMode) {
                                                        $rootScope.employeePopup.patients = $rootScope.employeePopup.carePatientMap[$rootScope.employeePopup.data.companyCareTypeId];
                                                    }
                                                }
                                            });
                                        }
                                    } else if (!employeeObj) {
                                        $rootScope.employeePopup.showLoadingImage = false;
                                        employeeObj = {};
                                        $rootScope.unmaskLoading();
                                        toastr.error("Failed to retrieve employee.");
                                    } else if (employeeObj && employeeObj.employeeCareRatesList && employeeObj.employeeCareRatesList.length === 0) {
                                        $rootScope.employeePopup.showLoadingImage = false;
                                    }
                                } else {
                                    $rootScope.employeePopup.showLoadingImage = false;
                                }
                            }
                            if (data != null) {
                                var id;
                                if (data.availabilityId)
                                    id = data.availabilityId;
                                if (data.scheduleId)
                                    id = data.scheduleId;
                                if (data.unavailabilityId)
                                    id = data.unavailabilityId;
                                var obj = {action: ontimetest.eventTypes[data.eventType].toLowerCase(), subAction: id};
                                EventTypeDAO.retrieveEventType(obj).then(function (res) {
                                    data = angular.copy(res);
                                    data.applyTo = "SINGLE";
                                    $rootScope.employeePopup.data = angular.copy(data);
                                }).catch(function (data) {
                                    toastr.error("Failed to retrieve data");
                                }).then(function () {
                                    open1();
                                });
                            } else {
                                open1();
                            }
                        });
                    }
                };
                if ($rootScope.employeePopup.employee && !$rootScope.employeePopup.isNew) {
                    $rootScope.employeePopup.employeeChanged($rootScope.employeePopup.data.employeeId, true);
                }
                if (ctrl.calendarView == 'month') {
                    $rootScope.employeePopup.employeeChanged(ctrl.viewEmployee.id, false, true);
                }
            }
            $rootScope.maskLoading();
            var careTypes;
            var carePatientMap;
            employeeObj = {};
            open();
        };

        ctrl.saveEmployeePopupChanges = function (data) {
            $rootScope.maskLoading();
            var data1 = angular.copy(data);
            if (ctrl.calendarView == 'month') {
                data1.employeeId = ctrl.viewEmployee.id;
            }
            var obj = {action: data1.eventType, data: data1};
            console.log("employee data :: " + JSON.stringify(data1));
            if ($rootScope.employeePopup.isNew) {
                EventTypeDAO.saveEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $rootScope.employeePopup.close();
                    ctrl.loadEvents();
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                obj.action = ontimetest.eventTypes[obj.action].toLowerCase();
                if (obj.data.availabilityId)
                    obj.subAction = obj.data.availabilityId;
                if (obj.data.scheduleId)
                    obj.subAction = obj.data.scheduleId;
                if (obj.data.unavailabilityId)
                    obj.subAction = obj.data.unavailabilityId;
                EventTypeDAO.updateEventType(obj).then(function (res) {
                    toastr.success("Updated successfully.");
                    $rootScope.employeePopup.close();
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };
        $rootScope.openEditModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.selectEmployeeModel.baseUrl = ctrl.baseUrl;
            $rootScope.selectEmployeeModel.companyCode = ctrl.companyCode;
            $rootScope.selectEmployeeModel.employee = angular.copy(employee);
            if (employee.languageSpoken != null && employee.languageSpoken.length > 0) {
                $rootScope.selectEmployeeModel.employee.languageSpoken = employee.languageSpoken.split(",");
            }
        };
        $rootScope.navigateToMonthPage = function (employee) {
            $state.go('app.employee-calendar', {id: employee.id});
        };

        ctrl.retrieveEmployees();
        ctrl.retrieveAllEmployees();
        ctrl.retrieveAllPositions();
    }

    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", "EmployeeDAO", "$rootScope", "PositionDAO", "$debounce", "PatientDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", "$stateParams", CalendarCtrl]);
})();
