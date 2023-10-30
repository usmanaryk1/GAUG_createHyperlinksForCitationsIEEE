(function () {
    function CalendarCtrl(Page, EmployeeDAO, $rootScope, PositionDAO, $debounce, PatientDAO, EventTypeDAO, $modal, $filter, $timeout, $state) {
        var ctrl = this;

        ctrl.employee_list = [];
        //ctrl.events  = [];
        var timeFormat = 'HH:mm';

        Page.setTitle("Employee Calendar");

        ctrl.calendarView = 'month';
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
                ctrl.searchParams.skip = ctrl.pageNo * ctrl.searchParams.limit;
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
                delete res.$promise;
                delete res.$resolved;
                var ids = (_.map(ctrl.employee_list, 'id')).toString();
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
            EventTypeDAO.retireveBySchedule({employeeIds: ids}).then(function (res) {
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
                $rootScope.employeePopup.calendarView = ctrl.calendarView;
                $rootScope.employeePopup.employeeList = ctrl.employeeList;
                $rootScope.employeePopup.dateFormat = "MM/DD/YYYY";
                $rootScope.employeePopup.patients = patients;
                $rootScope.employeePopup.reasons = ontimetest.reasons;
                $rootScope.employeePopup.eventTypes = ontimetest.eventTypes;
                $rootScope.employeePopup.recurranceTypes = ontimetest.recurranceTypes;
                $rootScope.employeePopup.employee = angular.copy(employeeObj);

                if (data == null) {
                    $rootScope.employeePopup.isNew = true;
                } else {
                    $rootScope.employeePopup.isNew = false;
                    $rootScope.employeePopup.data = data;
                    if (data.eventType != 'U')
                        $rootScope.employeePopup.data.applyTo = "DOW";
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                if (!angular.isDefined($rootScope.employeePopup.data)) {
                    $rootScope.employeePopup.data = {eventType: "A", recurranceType: "N", startTime: currentTime, endTime: currentTime, forLiveIn: false};
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
                                ctrl.saveEmployeePopupChanges($rootScope.employeePopup.data);
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
                        $rootScope.employeePopup.data = {eventType: old, recurranceType: "N"};
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
                $rootScope.employeePopup.employeeChanged = function (empId, editMode, viewMode) {
                    if ($rootScope.employeePopup.data.eventType == 'S' && !editMode) {
                        delete $rootScope.employeePopup.data.companyCareTypeId;
                        delete $rootScope.employeePopup.data.patientId;
                        $rootScope.employeePopup.carePatientMap = {};
                        $rootScope.employeePopup.careTypes = [];
                    }
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
                                if (employeeObj && employeeObj.employeeCareRatesList) {
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
                                    employeeObj = {};
                                    $rootScope.unmaskLoading();
                                    toastr.error("Failed to retrieve employee.");
                                }
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
                                data.applyTo = "DOW";
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
                };
                if ($rootScope.employeePopup.employee && !$rootScope.employeePopup.isNew) {
                    $rootScope.employeePopup.employeeChanged($rootScope.employeePopup.data.employeeId, true);
                }
                if (ctrl.calendarView == 'month') {
                    //static id for month view...change it later
                    $rootScope.employeePopup.employeeChanged(4, false, true);
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
            data1.startDate = moment(new Date(data1.startDate)).format($rootScope.employeePopup.dateFormat);
            data1.endDate = moment(new Date(data1.endDate)).format($rootScope.employeePopup.dateFormat);
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
        ctrl.retrieveEmployees();
        ctrl.retrieveAllEmployees();
        ctrl.retrieveAllPositions();
    }

    angular.module('xenon.controllers').controller('CalendarCtrl', ["Page", "EmployeeDAO", "$rootScope", "PositionDAO", "$debounce", "PatientDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", CalendarCtrl]);
})();
