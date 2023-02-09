(function () {
    function CalendarCtrl(Page, EmployeeDAO, $rootScope, PositionDAO, $debounce, PatientDAO, EventTypeDAO, $modal, $filter, $timeout, $state, $stateParams) {
        var ctrl = this;
        if ($state.current.name.indexOf('search-employee-calendar') >= 0) {
            ctrl.isEmployeeSearchPage = true;
        } else {
            ctrl.isEmployeeSearchPage = false;
        }
        ctrl.employee_list = [];
        $rootScope.selectEmployeeModel = {};
        ctrl.viewEmployee;
        ctrl.forShowTime = true;

        var timeFormat = 'HH:mm';

        Page.setTitle("Employee Calendar");

        ctrl.calendarView = 'week';
        setWeekDate();

        if ($stateParams.id != '') {
            ctrl.calendarView = 'month';
            setMonthDate();
        }

        ctrl.isOpen = false;
        ctrl.calendarDay = new Date();

        ctrl.changeToMonth = function () {
            ctrl.calendarView = 'month';
            setMonthDate();
            $rootScope.refreshCalendarView();
        }

        ctrl.showDatepicker = function (e) {
            if (e.currentTarget.className == "btn btn-default btn-sm btn-date") {
                if (ctrl.isOpen) {
                    ctrl.isOpen = false;
                } else {
                    ctrl.isOpen = true;
                }
            } else {
                ctrl.isOpen = false;
            }
        };

        ctrl.selectDate = function (e) {
            ctrl.showDatepicker(e);
            setTimeout(function () {
                var a = $filter('date')($rootScope.weekStart, $rootScope.dateFormat);
                var b = $filter('date')($rootScope.weekEnd, $rootScope.dateFormat);
                if (a != ctrl.startRetrieved || b != ctrl.endRetrieved) {
                    $rootScope.refreshCalendarView();
                }
            }, 200);
        };

        ctrl.changeToWeek = function () {
            ctrl.calendarView = 'week';
            setWeekDate();
            $rootScope.refreshCalendarView();
        }

        ctrl.searchParams = {skip: 0, limit: 10};

        ctrl.pageChanged = function (pagenumber) {
            ctrl.pageNo = pagenumber;
            ctrl.retrieveEmployees();
        };

        ctrl.applySearch = function () {
            ctrl.pageNo = 1;
            $rootScope.paginationLoading = true;
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

        $rootScope.refreshCalendarView = function () {
            $rootScope.paginationLoading = true;
            ctrl.retrieveEmployees();
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
                var obj;
                if ($stateParams.id != '') {
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
                if (ctrl.calendarView == 'month') {
                    ids = ctrl.employeeId;
                    if ($stateParams.id != '' && !obj) {
                        ids = $stateParams.id;
                    }
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
            var a = $filter('date')($rootScope.weekStart, $rootScope.dateFormat);
            var b = $filter('date')($rootScope.weekEnd, $rootScope.dateFormat);
            ctrl.startRetrieved = a;
            ctrl.endRetrieved = b;
            EventTypeDAO.retrieveBySchedule({employeeIds: ids, fromDate: a, toDate: b}).then(function (res) {
                delete res.$promise;
                delete res.$resolved;
                ctrl.events = res;
                $rootScope.paginationLoading = false;
            });
        }

        ctrl.retrieveAllEmployees = function () {
            EmployeeDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
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
            ctrl.officeStaffIds = [];
            PositionDAO.retrieveAll({positionGroup: ontime_data.positionGroups.OFFICE_STAFF}).then(function (res) {
                if (res && res.length > 0) {
                    angular.forEach(res, function (position) {
                        ctrl.officeStaffIds.push(position.id)
                    });
                }
            });
        };
        ctrl.passwordModalLogic = function (action, data, modal_id, modal_size, modal_backdrop) {
            $rootScope.passwordPopup = $modal.open({
                templateUrl: 'password-modal',
                size: 'md',
                backdrop: 'static',
                keyboard: false
            });
            $rootScope.passwordPopup.save = function () {
                if ($('#popuppassword')[0].checkValidity()) {
                    if ($rootScope.passwordPopup.password != ontime_data.pastEventAuthorizationPassword) {
                        toastr.error('Authorization Failed');
                        $rootScope.passwordPopup.closePopup();
                    } else {
                        if (action === 'delete') {
                            $rootScope.employeePopup.deleteSchedule();
                        } else if (action === 'edit') {
                            ctrl.saveEmployeePopupChanges($rootScope.employeePopup.data, true);
                        } else if (action === 'add') {
                            $rootScope.openModalCalendar(data, modal_id, modal_size, modal_backdrop);
                        }
                        $rootScope.passwordPopup.closePopup();
                    }
                }
            };
            $rootScope.passwordPopup.closePopup = function () {
                $rootScope.passwordPopup.close();
            };
        };
        ctrl.eventClicked = function (eventObj) {
            $rootScope.openModalCalendar1(eventObj, 'calendar-modal', 'lg', 'static');
        };

        $rootScope.openModalCalendar1 = function (data, modal_id, modal_size, modal_backdrop)
        {
            if (data != null && data.eventType == null && data.askPassword) {
                ctrl.passwordModalLogic('add', data, modal_id, modal_size, modal_backdrop);
            } else {
                $rootScope.openModalCalendar(data, modal_id, modal_size, modal_backdrop);
            }
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
                    $("#patient").select2({
                        // minimumResultsForSearch: -1,
                        placeholder: 'Select Patient...',
                        // minimumInputLength: 1,
                        // placeholder: 'Search',
                    }).on('select2-open', function ()
                    {
                        // Adding Custom Scrollbar
                        $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                    });
                    $("#patient1").select2({
                        // minimumResultsForSearch: -1,
                        placeholder: 'Select Patient...',
                        // minimumInputLength: 1,
                        // placeholder: 'Search',
                    }).on('select2-open', function ()
                    {
                        // Adding Custom Scrollbar
                        $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                    });
                }, 200);
                $rootScope.employeePopup = $modal.open({
                    templateUrl: 'app/calendar/views/employee_calendar_modal.html',
                    size: modal_size,
                    backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                    keyboard: false
                });
                $rootScope.employeePopup.todayDate = new Date();
                if (data != null && data.eventType == null) {
                    $rootScope.employeePopup.todayDate = data.startDate;
                }
                $rootScope.employeePopup.calendarView = ctrl.calendarView;
                $rootScope.employeePopup.employeeList = ctrl.employeeList;
                $rootScope.employeePopup.patients = patients;
                $rootScope.employeePopup.reasons = ontime_data.employeeReasons;
                $rootScope.employeePopup.eventTypes = ontime_data.eventTypes;
                $rootScope.employeePopup.recurranceTypes = ontime_data.recurranceTypes;
                $rootScope.employeePopup.employee = angular.copy(employeeObj);
                $rootScope.employeePopup.patientMandatory = true;
                if (data == null) {
                    $rootScope.employeePopup.isNew = true;
                    $rootScope.employeePopup.showEmployee = true;
                } else {
                    if (data.eventType == null) {
                        $rootScope.employeePopup.isNew = true;
                        $rootScope.employeePopup.showEmployee = false;
                    } else {
                        $rootScope.employeePopup.isNew = false;
                        $rootScope.employeePopup.showEmployee = false;
                        var a = moment(new Date(data.startDate));
                        var diff = moment().diff(a, 'days');
                        if (diff > 0) { // past date
                            data.isEdited1 = true;
                        }
                        data.isEdited = true;
                        $rootScope.employeePopup.data = data;
                        if (data.eventType != 'U')
                            $rootScope.employeePopup.data.applyTo = "SINGLE";
                    }
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                if (!angular.isDefined($rootScope.employeePopup.data)) {
                    $rootScope.employeePopup.data = {eventType: "S", recurranceType: "N", startTime: currentTime, endTime: currentTime, forLiveIn: false, startDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat), endDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat)};
                }
                if (data && data.eventType == null) {
                    var id;
                    if (data.data) {
                        id = data.data.id;
                        $rootScope.employeePopup.cellClickEmployeeId = id;
                    } else {
                        id = ctrl.viewEmployee.id;
                    }
                    $rootScope.employeePopup.data = {eventType: "S", recurranceType: "N", startTime: currentTime, endTime: currentTime, forLiveIn: false, startDate: $filter('date')(data.startDate, $rootScope.dateFormat), endDate: $filter('date')(data.startDate, $rootScope.dateFormat), employeeId: id};
                }
                $rootScope.employeePopup.closePopup = function () {
                    $rootScope.paginationLoading = false;
                    $rootScope.employeePopup.close();
                };
                $rootScope.employeePopup.save1 = function () {
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
                                        $rootScope.employeePopup.response = true;
                                    }
                                } else {
                                    $rootScope.employeePopup.response = true;
                                }
                            }
                        } else {
                            console.log("invalid form");
                        }
                    });
                };
                $rootScope.employeePopup.save = function () {
                    delete $rootScope.employeePopup.response;
                    $rootScope.employeePopup.save1();
                    $timeout(function () {
                        if ($rootScope.employeePopup.response) {
                            ctrl.saveEmployeePopupChanges($rootScope.employeePopup.data);
                        }
                    });
                };
                $rootScope.employeePopup.retrievePatientBasedOnCare = function () {
                    delete $rootScope.employeePopup.data.patientId;
                    setTimeout(function () {
                        $("#patient").select2('data', null);
                        $("#patient1").select2('data', null);
                    }, 100);
                    $rootScope.employeePopup.patients = $rootScope.employeePopup.carePatientMap[$rootScope.employeePopup.data.companyCareTypeId];
                };
                $rootScope.employeePopup.changed = function (form, event) {
                    if (event != 'repeat') {
                        var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                        var old = $rootScope.employeePopup.data.eventType;
                        $rootScope.employeePopup.data = {eventType: old, recurranceType: "N", startDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat), endDate: $filter('date')($rootScope.employeePopup.todayDate, $rootScope.dateFormat)};
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
                            $("#patient").select2({
                                // minimumResultsForSearch: -1,
                                placeholder: 'Select Patient...',
                                // minimumInputLength: 1,
                                // placeholder: 'Search',
                            }).on('select2-open', function ()
                            {
                                // Adding Custom Scrollbar
                                $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                            });
                            $("#patient1").select2({
                                // minimumResultsForSearch: -1,
                                placeholder: 'Select Patient...',
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
                $rootScope.employeePopup.openPasswordModal = function (action) {
                    $rootScope.employeePopup.action = action;
                    if (!$rootScope.employeePopup.data.isEdited1) {
                        if (action == 'delete') {
                            $rootScope.employeePopup.deleteSchedule();
                        } else {
                            $rootScope.employeePopup.save();
                        }
                    } else {
                        function open() {
                            $rootScope.employeePopup.close();
                            ctrl.passwordModalLogic(action);
                        }
                        if (action == 'delete') {
                            open();
                        } else {
                            delete $rootScope.employeePopup.response;
                            $rootScope.employeePopup.save1();
                            $timeout(function () {
                                if ($rootScope.employeePopup.response) {
                                    open();
                                }
                            });
                        }
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
                    EventTypeDAO.delete({subAction: id, action: ontime_data.eventTypes[obj.eventType].toLowerCase(), applyTo: obj.applyTo, isEmployeeSchedule: true}).then(function (res) {
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
                        setTimeout(function () {
                            $("#patient").select2('data', null);
                            $("#patient1").select2('data', null);
                        }, 100);
                        delete $rootScope.employeePopup.data.companyCareTypeId;
                        delete $rootScope.employeePopup.data.patientId;
                        $rootScope.employeePopup.carePatientMap = {};
                        $rootScope.employeePopup.careTypes = [];
                    }
                    if (!($rootScope.employeePopup.data.eventType != 'S' && !editMode && !viewMode)) {
                        $rootScope.paginationLoading = true;
                        EmployeeDAO.getEmployeesForSchedule({employeeIds: empId}).then(function (res) {
                            $rootScope.employeePopup.patientMandatory = true;
                            employeeObj = res[0];
                            if (ctrl.officeStaffIds.indexOf(res[0].companyPositionId) > -1) {
                                $rootScope.employeePopup.patientMandatory = false;
                            }
                            if (ctrl.calendarView == 'month' || !$rootScope.employeePopup.isNew || !$rootScope.employeePopup.showEmployee) {
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
                                            PatientDAO.retrieveForCareType({companyCareTypes: id, subAction: "active", sortBy: 'lName', order: 'asc'}).then(function (res) {
                                                carePatientMap[res.headers.careid] = res.data;
                                                next++;
                                            }).catch(function (data) {
                                                toastr.error(data.data);
                                            }).then(function () {
                                                if (next === length || length == 1) {
                                                    $rootScope.paginationLoading = false;
                                                    careTypes = careTypesSelected;
                                                    $rootScope.employeePopup.carePatientMap = carePatientMap;
                                                    $rootScope.employeePopup.careTypes = careTypes;
                                                    if (editMode) {
                                                        $rootScope.employeePopup.patients = $rootScope.employeePopup.carePatientMap[$rootScope.employeePopup.data.companyCareTypeId];
                                                        if ($rootScope.employeePopup.data.patientId) {
                                                            setTimeout(function () {
                                                                $("#patient").select2({val: $rootScope.employeePopup.data.patientId});
                                                                $("#patient1").select2({val: $rootScope.employeePopup.data.patientId});
                                                            }, 100);
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    } else if (!employeeObj) {
                                        $rootScope.paginationLoading = false;
                                        employeeObj = {};
                                        $rootScope.unmaskLoading();
                                        toastr.error("Failed to retrieve employee.");
                                    } else if (employeeObj && employeeObj.employeeCareRatesList && employeeObj.employeeCareRatesList.length === 0) {
                                        $rootScope.paginationLoading = false;
                                    }
                                } else {
                                    $rootScope.paginationLoading = false;
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
                                if (id) {
                                    var obj = {action: ontime_data.eventTypes[data.eventType].toLowerCase(), subAction: id};
                                    EventTypeDAO.retrieveEventType(obj).then(function (res) {
                                        data = angular.copy(res);
                                        data.applyTo = "SINGLE";
                                        var a = moment(new Date(data.startDate));
                                        var diff = moment().diff(a, 'days');
                                        if (diff > 0) { // past date
                                            data.isEdited1 = true;
                                        }
                                        data.isEdited = true;
                                        $rootScope.employeePopup.data = angular.copy(data);
                                    }).catch(function (data) {
                                        toastr.error("Failed to retrieve data");
                                    }).then(function () {
                                        open1();
                                    });
                                } else {
                                    open1();
                                }
                            } else {
                                open1();
                            }
                        });
                    }
                };
                if ($rootScope.employeePopup.employee && !$rootScope.employeePopup.isNew) {
                    $rootScope.employeePopup.employeeChanged($rootScope.employeePopup.data.employeeId, true);
                } else if ($rootScope.employeePopup.employee && $rootScope.employeePopup.isNew && !$rootScope.employeePopup.showEmployee) {
                    $rootScope.employeePopup.employeeChanged($rootScope.employeePopup.data.employeeId, true, true);
                } else if (ctrl.calendarView == 'month') {
                    $rootScope.employeePopup.employeeChanged(ctrl.viewEmployee.id, false, true);
                }
            }
            $rootScope.maskLoading();
            var careTypes;
            var carePatientMap;
            employeeObj = {};
            open();
        };

        ctrl.saveEmployeePopupChanges = function (data, isPast) {
            $rootScope.maskLoading();
            var data1 = angular.copy(data);
            if (ctrl.calendarView == 'month') {
                data1.employeeId = ctrl.viewEmployee.id;
            }
            if (!data1.employeeId && $rootScope.employeePopup.isNew && !$rootScope.employeePopup.showEmployee) {
                data1.employeeId = $rootScope.employeePopup.cellClickEmployeeId;
            }
            if (data1.eventType != 'S') {
                delete data1.isEdited;
            }
            delete data1.isEdited1;
            var obj = {action: data1.eventType, data: data1, isPast: false};
            if (isPast) {
                obj.isPast = true;
            }
            console.log("employee data :: " + JSON.stringify(data1));
            if ($rootScope.employeePopup.isNew) {
                EventTypeDAO.saveEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $rootScope.employeePopup.close();
                    ctrl.retrieveEmployees();
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                obj.action = ontime_data.eventTypes[obj.action].toLowerCase();
                if (obj.data.availabilityId)
                    obj.subAction = obj.data.availabilityId;
                if (obj.data.scheduleId)
                    obj.subAction = obj.data.scheduleId;
                if (obj.data.unavailabilityId)
                    obj.subAction = obj.data.unavailabilityId;
                EventTypeDAO.updateEventType(obj).then(function (res) {
                    toastr.success("Updated successfully.");
                    $rootScope.employeePopup.close();
                    ctrl.retrieveEmployees();
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
        function setMonthDate() {
            var startOfMonth = moment().startOf('month');
            var endOfMonthView = moment().endOf('month').endOf('week');
            $rootScope.weekStart = new Date(startOfMonth);
            $rootScope.weekEnd = new Date(endOfMonthView);
        }
        function setWeekDate() {
            var startOfWeek = moment().startOf('week');
            var endOfWeek = moment().endOf('week');
            $rootScope.weekStart = new Date(startOfWeek);
            $rootScope.weekEnd = new Date(endOfWeek);
        }
        $rootScope.navigateToMonthPage = function (employee) {
            delete ctrl.monthEmployee;
            $state.go('app.employee-calendar', {id: employee.id});
        };

        ctrl.retrieveEmployees();
        ctrl.retrieveAllEmployees();
        ctrl.retrieveAllPositions();
        if (ctrl.isEmployeeSearchPage) {
            function googleMapFunctions(latitude, longitude) {
                loadGoogleMaps(3).done(function ()
                {
                    var map;
                    var geocoder = new google.maps.Geocoder();
                    var newyork;
                    if (latitude && latitude !== null && longitude && longitude !== null) {
                        newyork = new google.maps.LatLng(latitude, longitude);
                    } else {
                        newyork = new google.maps.LatLng(40.7127837, -74.00594);
                    }
                    var marker;
                    function initialize()
                    {
                        var mapOptions = {
                            zoom: 14,
                            center: newyork
                        };
                        // Calculate Height
                        var el = document.getElementById('map-1'),
                                doc_height = $('#map-1').height();
                        // Adjust map height to fit the document contianer
                        el.style.height = doc_height + 'px';
                        map = new google.maps.Map(el, mapOptions);
                        var input = /** @type {!HTMLInputElement} */(
                                document.getElementById('pac-input'));
                        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
                        var autocomplete = new google.maps.places.Autocomplete(input);
                        autocomplete.bindTo('bounds', map);
                        marker = new google.maps.Marker({
                            position: newyork,
                            map: map,
                            draggable: true,
                        });
                        marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
                        // Data for the markers consisting of a name, a LatLng and a zIndex for the
                        // order in which these markers should display on top of each other.
                        var beaches = [
                            ['New Museum', 40.7223416, -73.9950792],
                            ['Freeemans', 40.7220533, -73.9946083],
                            ['Rice To Riches', 40.7218906, -73.997949],
                            ['Church Street', 40.7151974, -74.0099406]
                        ];
                        function showInfo(latlng, infowindow) {
                            geocoder.geocode({
                                'latLng': latlng
                            }, function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[1]) {
                                        // here assign the data to asp lables
                                        infowindow.setContent('<div id="content">' +
                                                '<div id="firstHeading" class="firstHeading">Abreu, Rafaela</div>' +
                                                '<div id="bodyContent">' + results[1].formatted_address +
                                                '</div><div>10 Miles</div>' +
                                                '</div>');
                                    } else {
                                        alert('No results found');
                                    }
                                } else {
                                    alert('Geocoder failed due to: ' + status);
                                }
                            });
                        }
                        function setMarkers(map) {
                            // Adds markers to the map.
                            // Marker sizes are expressed as a Size of X,Y where the origin of the image
                            // (0,0) is located in the top left of the image.
                            for (var i = 0; i < beaches.length; i++) {
                                var beach = beaches[i];
                                var marker = new google.maps.Marker({
                                    position: {lat: beach[1], lng: beach[2]},
                                    map: map,
                                    title: beach[0]
                                });
                                marker.addListener('click', function (e) {
                                    var infowindow = new google.maps.InfoWindow();
                                    showInfo(this.position, infowindow);
                                    infowindow.open(map, this);
                                });
                            }
                        }
                        setMarkers(map);
                        autocomplete.addListener('place_changed', function () {
                            marker.setVisible(false);
                            var place = autocomplete.getPlace();
                            if (!place.geometry) {
                                try {
                                    if (place.name != null && place.name.indexOf(",") >= 0) {
                                        var locationArray = place.name.split(",");
                                        var LatLong = new google.maps.LatLng(Number(locationArray[0]), Number(locationArray[1]));
                                        map.setCenter(LatLong);
                                        place.geometry = {location: LatLong};
                                    }
                                } catch (e) {
                                    return;
                                }
//                                window.alert("Autocomplete's returned place contains no geometry");
//                                return;
                            }
                            // If the place has a geometry, then present it on a map.
                            if (place.geometry != null) {
                                if (place.geometry.viewport) {
                                    map.fitBounds(place.geometry.viewport);
                                } else {
                                    map.setCenter(place.geometry.location);
                                    map.setZoom(17);  // Why 17? Because it looks good.
                                }
                            }
                            marker.setIcon(/** @type {google.maps.Icon} */({
                                url: place.icon,
                                size: new google.maps.Size(71, 71),
                                origin: new google.maps.Point(0, 0),
                                anchor: new google.maps.Point(17, 34),
                                scaledSize: new google.maps.Size(35, 35)
                            }));
//                            alert(place.geometry.location)
                            marker.setPosition(place.geometry.location);
                            marker.setVisible(true);
                            var infowindow = new google.maps.InfoWindow();
                            showInfo(place.geometry.location, infowindow);
                            infowindow.open(map, marker);
                        });
                    }
                    initialize();
                });
            }
            googleMapFunctions(null, null);
            ctrl.retrieveAllPatients = function () {
                PatientDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
                    ctrl.patientList = res;
                });
            };
            ctrl.retrieveAllPatients();
        }
    }

    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", "EmployeeDAO", "$rootScope", "PositionDAO", "$debounce", "PatientDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", "$stateParams", CalendarCtrl]);
})();
