(function () {
    function PatientCalendarCtrl(Page, PatientDAO, $rootScope, $debounce, EmployeeDAO, EventTypeDAO, $modal, $filter, $timeout, $state, $stateParams, CareTypeDAO, InsurerDAO) {

        var ctrl = this;

        ctrl.patient_list = [];

        var timeFormat = 'HH:mm';

        Page.setTitle("Patient Calendar");

        ctrl.calendarView = 'week';
        setWeekDate();

        if ($stateParams.id != '') {
            ctrl.calendarView = 'month';
            setMonthDate();
        }

        ctrl.viewPatient;

        ctrl.isOpen = false;

        ctrl.calendarDay = new Date();
        ctrl.insuranceProviderMap = {};
        ctrl.nursingCareMap = {};
        ctrl.staffCoordinatorMap = {};
        ctrl.changeToMonth = function () {
            ctrl.calendarView = 'month';
            setMonthDate();
            $rootScope.refreshCalendarView();
        };

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
        };

        ctrl.searchParams = {skip: 0, limit: 10};

        ctrl.pageChanged = function (pagenumber) {
            ctrl.pageNo = pagenumber;
            ctrl.retrievePatients();
        };

        ctrl.applySearch = function () {
            ctrl.pageNo = 1;
            $rootScope.paginationLoading = true;
            $debounce(ctrl.retrievePatients, 500);
        };

        ctrl.resetFilters = function () {
            ctrl.searchParams = {limit: 10, skip: 0};
            ctrl.searchParams.openCaseEndDate = null;
            ctrl.searchParams.openCaseStartDate = null;
            $('#coordinatorIds').select2('val', null);
            $('#patientIds').select2('val', null);
            $('#positions').select2('val', null);
            $('#languages').select2('val', null);
            ctrl.applySearch();
        };

        $rootScope.refreshCalendarView = function () {
            $rootScope.paginationLoading = true;
            ctrl.retrievePatients();
        };

        ctrl.retrievePatients = function () {
            if (ctrl.pageNo > 1) {
                ctrl.searchParams.skip = (ctrl.pageNo - 1) * ctrl.searchParams.limit;
            } else {
                ctrl.searchParams.skip = 0;
            }
            var searchParams = angular.copy(ctrl.searchParams);
            if (searchParams.patientIds != null) {
                searchParams.patientIds = searchParams.patientIds.toString();
            }
            if (searchParams.coordinatorIds != null) {
                searchParams.coordinatorIds = searchParams.coordinatorIds.toString();
            }
            if (searchParams.languages != null) {
                searchParams.languages = searchParams.languages.toString();
            }
            delete searchParams.openCase;
            PatientDAO.getPatientsForSchedule(searchParams).then(function (res) {
                ctrl.patient_list = res;
                ctrl.count = $rootScope.totalRecords;
                if (!ctrl.viewPatient) {
                    ctrl.viewPatient = res[0];
                }
                var obj;
                if ($stateParams.id != '') {
                    angular.forEach(res, function (item) {
                        if (item.id == $stateParams.id) {
                            obj = angular.copy(item);
                        }
                    });
                    if (!obj) {
                        PatientDAO.getPatientsForSchedule({patientIds: $stateParams.id}).then(function (res1) {
                            ctrl.viewPatient = angular.copy(res1[0]);
                            ctrl.patientId = ctrl.viewPatient.id;
                        });
                    } else {
                        ctrl.viewPatient = angular.copy(obj);
                    }
                }
                if (ctrl.viewPatient) {
                    ctrl.patientId = ctrl.viewPatient.id;
                }
                delete res.$promise;
                delete res.$resolved;
                var ids = (_.map(ctrl.patient_list, 'id')).toString();
                if (ctrl.calendarView == 'month') {
                    ids = ctrl.patientId;
                    if ($stateParams.id != '' && !obj) {
                        ids = $stateParams.id;
                    }
                }
                ctrl.getAllEvents(ids);
                ctrl.totalRecords = $rootScope.totalRecords;
            });
        };

        ctrl.checkOpenCase = function () {
            if (ctrl.searchParams.openCase) {
                ctrl.searchParams.openCaseStartDate = $filter('date')($rootScope.weekStart, $rootScope.dateFormat);
                ctrl.searchParams.openCaseEndDate = $filter('date')($rootScope.weekEnd, $rootScope.dateFormat);
            } else {
                delete ctrl.searchParams.openCaseStartDate;
                delete ctrl.searchParams.openCaseEndDate;
            }
        };

        ctrl.loadEvents = function () {
            ctrl.pageNo = 0;
            ctrl.searchParams.limit = 10;
            ctrl.retrievePatients();
        };

        ctrl.getAllEvents = function (ids) {
            ctrl.openCaseMap = {};
            var a = $filter('date')($rootScope.weekStart, $rootScope.dateFormat);
            var b = $filter('date')($rootScope.weekEnd, $rootScope.dateFormat);
            ctrl.startRetrieved = a;
            ctrl.endRetrieved = b;
            EventTypeDAO.retrieveBySchedule({patientIds: ids, fromDate: a, toDate: b}).then(function (res) {
                delete res.$promise;
                delete res.$resolved;
                splitUnavailableEvents(res);
                angular.forEach(res, function (item) {
                    if (!item.employeeId && item.eventType === 'S') {
                        if (!ctrl.openCaseMap[item.startDate]) {
                            ctrl.openCaseMap[item.startDate] = {};
                        }
                        ctrl.openCaseMap[item.startDate][item.patientId] = {startTime: item.startTime, endTime: item.endTime}; // angular.copy(item);
                    }
                });
                $rootScope.paginationLoading = false;
            });
        };

        function splitUnavailableEvents(res) {
            ctrl.events = [];
            var endCount = 6;
            angular.forEach(res, function (content) {
                if (content.eventType == 'U') {
                    var startDay = new Date(content.startDate).getDay();
                    var start = new Date(content.startDate);
                    var end = new Date(content.endDate);
                    var i = 0;
                    while (start <= end)
                    {
                        var end1;
                        var momentObj = moment(start);
                        var momentObj1 = angular.copy(momentObj);
                        if (i == 0) {
                            start = new Date(momentObj.add(7 - startDay, "days"));
                        } else {
                            start = new Date(momentObj.add(7, "days"));
                        }
                        end1 = new Date(momentObj.add(endCount, "days"));
                        var start1 = new Date(momentObj);
                        if (start1 >= end) {
                            end1 = end;
                        }
                        if (i == 0) {
                            var temp = angular.copy(content);
                            temp.startDate = content.startDate;
                            var end2 = new Date(momentObj1.add(endCount - startDay, "days"));
                            if (new Date(content.endDate) < end2) {
                                temp.endDate = content.endDate;
                            } else {
                                temp.endDate = $filter('date')(end2, $rootScope.dateFormat);
                            }
                            ctrl.events.push(temp);
                        }
                        if (start <= end) {
                            var temp = angular.copy(content);
                            temp.startDate = $filter('date')(start, $rootScope.dateFormat);
                            temp.endDate = $filter('date')(end1, $rootScope.dateFormat);
                            ctrl.events.push(temp);
                        }
                        i++;
                    }
                } else {
                    ctrl.events.push(content);
                }
            });
        }

        ctrl.retrieveAllPatients = function () {
            PatientDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
                ctrl.patientList = res;
            });
        };

        ctrl.retrieveAllCoordinators = function () {
            $rootScope.maskLoading();
            EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.NURSING_CARE_COORDINATOR + "," + ontimetest.positionGroups.STAFFING_COORDINATOR}).then(function (res) {
                ctrl.employeeCoordinateList = res;
                $rootScope.unmaskLoading();
            }).catch(function (data, status) {
                toastr.error("Could not load Coordinators");
                $rootScope.unmaskLoading();
            });
        };

        ctrl.savePatientPopupChanges = function (data, isPast) {
            $rootScope.maskLoading();
            var data1 = angular.copy(data);
            if (ctrl.calendarView == 'month') {
                data1.patientId = ctrl.viewPatient.id;
            }
            if (!data1.patientId && $rootScope.patientPopup.isNew && !$rootScope.patientPopup.showPatient) {
                data1.patientId = $rootScope.patientPopup.cellClickPatientId;
            }
            if (data1.eventType != 'S') {
                delete data1.isEdited;
            }
            delete data1.isEdited1;
            console.log("patient data :: " + JSON.stringify(data1));
            var obj = {action: data1.eventType, data: data1, isPast: false};
            if (isPast) {
                obj.isPast = true;
            }
            if ($rootScope.patientPopup.isNew) {
                EventTypeDAO.saveEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $rootScope.patientPopup.close();
                    ctrl.retrievePatients();
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                obj.action = ontimetest.eventTypes[obj.action].toLowerCase();
                if (obj.data.scheduleId)
                    obj.subAction = obj.data.scheduleId;
                if (obj.data.unavailabilityId)
                    obj.subAction = obj.data.unavailabilityId;
                EventTypeDAO.updateEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $rootScope.patientPopup.close();
                    ctrl.retrievePatients();
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
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
                    if ($rootScope.passwordPopup.password != ontimetest.pastEventAuthorizationPassword) {
                        toastr.error('Authorization Failed');
                        $rootScope.passwordPopup.closePopup();
                    } else {
                        if (action === 'delete') {
                            $rootScope.patientPopup.deleteSchedule();
                        } else if (action === 'edit') {
                            ctrl.savePatientPopupChanges($rootScope.patientPopup.data, true);
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
            var patientObj;
            var data;
            var employees;

            function open() {
                $rootScope.unmaskLoading();
                setTimeout(function () {
                    $("#eventPatientIds").select2({
                        // minimumResultsForSearch: -1,
                        placeholder: 'Select Patient...',
                        // minimumInputLength: 1,
                        // placeholder: 'Search',
                    }).on('select2-open', function ()
                    {
                        // Adding Custom Scrollbar
                        $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                    });
                    $("#employee").select2({
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
                $rootScope.patientPopup = $modal.open({
                    templateUrl: modal_id,
                    size: modal_size,
                    backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                    keyboard: false
                });
                $rootScope.patientPopup.todayDate = new Date();
                if (data != null && data.eventType == null) {
                    $rootScope.patientPopup.todayDate = data.startDate;
                }
                $rootScope.patientPopup.calendarView = ctrl.calendarView;
                $rootScope.patientPopup.patientList = ctrl.patientList;
                $rootScope.patientPopup.reasons = ontimetest.patientReasons;
                $rootScope.patientPopup.employees = [];
                $rootScope.patientPopup.eventTypes = ontimetest.eventTypes;
                $rootScope.patientPopup.recurranceTypes = ontimetest.recurranceTypes;
                $rootScope.patientPopup.patient = angular.copy(patientObj);
                if (data == null) {
                    $rootScope.patientPopup.isNew = true;
                    $rootScope.patientPopup.showPatient = true;
                } else {
                    if (data.eventType == null) {
                        $rootScope.patientPopup.isNew = true;
                        $rootScope.patientPopup.showPatient = false;
                    } else {
                        $rootScope.patientPopup.isNew = false;
                        $rootScope.patientPopup.showPatient = false;
                        var a = moment(new Date(data.startDate));
                        var diff = moment().diff(date, 'days');
                        if (diff > 0) { // past date
                            data.isEdited1 = true;
                        }
                        data.isEdited = true;
                        $rootScope.patientPopup.data = data;
                        if (data.eventType != 'U')
                            $rootScope.patientPopup.data.applyTo = "SINGLE";
                    }
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                $rootScope.patientPopup.currentStartTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                $rootScope.patientPopup.currentEndTime = $rootScope.patientPopup.currentStartTime;
                if (data && data.eventType == null) {
                    var id;
                    if (data.data) {
                        id = data.data.id;
                    } else {
                        id = ctrl.viewPatient.id;
                    }
                    var date = $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat);
                    if (ctrl.openCaseMap[date] && ctrl.openCaseMap[date][id]) {
                        var get = ctrl.openCaseMap[date][id];
                        $rootScope.patientPopup.currentStartTime = get.startTime;
                        $rootScope.patientPopup.currentEndTime = get.endTime;
                    }
                }
                if (!angular.isDefined($rootScope.patientPopup.data)) {
                    $rootScope.patientPopup.data = {eventType: "S", recurranceType: "N", forLiveIn: false, startTime: $rootScope.patientPopup.currentStartTime, endTime: $rootScope.patientPopup.currentEndTime, startDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat), endDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat)};
                }
                if (data && data.eventType == null) {
                    var id;
                    if (data.data) {
                        id = data.data.id;
                        $rootScope.patientPopup.cellClickPatientId = id;
                    } else {
                        id = ctrl.viewPatient.id;
                    }
                    $rootScope.patientPopup.data = {eventType: "S", recurranceType: "N", forLiveIn: false, startTime: $rootScope.patientPopup.currentStartTime, endTime: $rootScope.patientPopup.currentEndTime, startDate: $filter('date')(data.startDate, $rootScope.dateFormat), endDate: $filter('date')(data.startDate, $rootScope.dateFormat), patientId: id};
                }
                $rootScope.patientPopup.closePopup = function () {
                    $rootScope.paginationLoading = false;
                    $rootScope.patientPopup.close();
                };
                $rootScope.patientPopup.save1 = function () {
                    $timeout(function () {
                        var name = '#' + "popuppatient" + $rootScope.patientPopup.data.eventType.toLowerCase();
                        if ($(name)[0].checkValidity()) {
                            var a = moment(new Date($rootScope.patientPopup.data.startDate));
                            var b = moment(new Date($rootScope.patientPopup.data.endDate));
                            var diff = b.diff(a, 'days');
                            if (diff > 6 && $rootScope.patientPopup.data.eventType == 'S') {
                                toastr.error("Date range should be no more of 7 days.");
                            } else if (diff > 89 && $rootScope.patientPopup.data.eventType == 'U') {
                                toastr.error("Date range should be no more of 90 days.");
                            } else {
                                $rootScope.patientPopup.response = true;
                            }
                        } else {
                            console.log("invalid form")
                        }
                    });
                };
                $rootScope.patientPopup.save = function () {
                    delete $rootScope.patientPopup.response;
                    $rootScope.patientPopup.save1();
                    $timeout(function () {
                        if ($rootScope.patientPopup.response) {
                            ctrl.savePatientPopupChanges($rootScope.patientPopup.data);
                        }
                    });
                };
                $rootScope.patientPopup.changed = function (form, event) {
                    if (event != 'repeat') {
                        var old = $rootScope.patientPopup.data.eventType;
                        $rootScope.patientPopup.data = {eventType: old, recurranceType: "N", startDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat), endDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat)};
                        if (old == 'S') {
                            $rootScope.patientPopup.data.forLiveIn = false;
                            $rootScope.patientPopup.data.startTime = $rootScope.patientPopup.currentStartTime;
                            $rootScope.patientPopup.data.endTime = $rootScope.patientPopup.currentEndTime;
                        }
                        if (old == 'U') {
                            $rootScope.patientPopup.data.isPaid = false;
                        }
                        setTimeout(function () {
                            $("#eventPatientIds").select2({
                                // minimumResultsForSearch: -1,
                                placeholder: 'Select Patient...',
                                // minimumInputLength: 1,
                                // placeholder: 'Search',
                            }).on('select2-open', function ()
                            {
                                // Adding Custom Scrollbar
                                $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                            });
                            $("#employee").select2({
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
                $rootScope.patientPopup.retrieveEmployeeBasedOnCare = function () {
                    delete $rootScope.patientPopup.data.employeeId;
                    setTimeout(function () {
                        $("#employee").select2('data', null);
                    }, 100);
                    $rootScope.patientPopup.employees = $rootScope.patientPopup.careEmployeeMap[$rootScope.patientPopup.data.companyCareTypeId];
                };
                $rootScope.patientPopup.openPasswordModal = function (action) {
                    $rootScope.patientPopup.action = action;
                    if (!$rootScope.patientPopup.data.isEdited1) {
                        if (action == 'delete') {
                            $rootScope.patientPopup.deleteSchedule();
                        } else {
                            $rootScope.patientPopup.save();
                        }
                    } else {
                        function open() {
                            $rootScope.patientPopup.close();
                            ctrl.passwordModalLogic(action);
                        }
                        if (action == 'delete') {
                            open();
                        } else {
                            delete $rootScope.patientPopup.response;
                            $rootScope.patientPopup.save1();
                            $timeout(function () {
                                if ($rootScope.patientPopup.response) {
                                    open();
                                }
                            });
                        }
                    }
                };
                $rootScope.patientPopup.deleteSchedule = function () {
                    var obj = $rootScope.patientPopup.data;
                    var id;
                    if (obj.availabilityId)
                        id = obj.availabilityId;
                    if (obj.scheduleId)
                        id = obj.scheduleId;
                    if (obj.unavailabilityId)
                        id = obj.unavailabilityId;
                    $rootScope.maskLoading();
                    EventTypeDAO.delete({subAction: id, action: ontimetest.eventTypes[obj.eventType].toLowerCase(), applyTo: obj.applyTo, isEmployeeSchedule: false}).then(function (res) {
                        ctrl.retrievePatients();
                        toastr.success("Event deleted.");
                        $rootScope.patientPopup.close();
                    }).catch(function (data, status) {
                        toastr.error(data.data);
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }
                $rootScope.patientPopup.patientChanged = function (patientId, editMode, viewMode) {
                    if ($rootScope.patientPopup.data.eventType == 'S' && !editMode) {
                        setTimeout(function () {
                            $("#employee").select2('data', null);
                        }, 100);
                        delete $rootScope.patientPopup.data.companyCareTypeId;
                        delete $rootScope.patientPopup.data.employeeId;
                        $rootScope.patientPopup.carePatientMap = {};
                        $rootScope.patientPopup.careTypes = [];
                    }
                    if (!($rootScope.patientPopup.data.eventType != 'S' && !editMode && !viewMode)) {
                        $rootScope.paginationLoading = true;
                        PatientDAO.getPatientsForSchedule({patientIds: patientId}).then(function (res) {
                            patientObj = res[0];
                            if (ctrl.calendarView == 'month' || !$rootScope.patientPopup.isNew || !$rootScope.patientPopup.showPatient) {
                                $rootScope.patientPopup.patient = angular.copy(patientObj);
                            }
                        }).catch(function (data, status) {
                            toastr.error("Failed to retrieve patient.");
                        }).then(function () {
                            function open1() {

                                // no need to retrieve patient object if you already have, just get all careTypes of patient's insuranceProviderId
                                if ($rootScope.patientPopup.data.eventType == 'S' || viewMode) {
                                    if (patientObj && patientObj.patientCareTypeCollection && patientObj.patientCareTypeCollection.length > 0) {
                                        var careTypesSelected = [];
                                        var length = patientObj.patientCareTypeCollection.length;
                                        var str = "";
                                        for (var i = 0; i < length; i++) {
                                            careTypesSelected.push(patientObj.patientCareTypeCollection[i].insuranceCareTypeId.companyCaretypeId);
                                            if (str.length > 0) {
                                                str = str + ",";
                                            }
                                            str = str + patientObj.patientCareTypeCollection[i].insuranceCareTypeId.companyCaretypeId.id;
                                        }
                                        careTypes = careTypesSelected;
                                        EmployeeDAO.retrieveAll({companyCareTypes: str, subAction: "active", sortBy: 'lName', order: 'asc'}).then(function (res) {
                                            careEmployeeMap = {};
                                            angular.forEach(res, function (item) {
                                                angular.forEach(item.employeeCareRatesList, function (item1) {
                                                    var temp = careEmployeeMap[item1.companyCaretypeId.id];
                                                    if (temp == null) {
                                                        temp = [];
                                                    }
                                                    temp.push(item);
                                                    careEmployeeMap[item1.companyCaretypeId.id] = temp;
                                                });
                                            });
                                            $rootScope.patientPopup.careEmployeeMap = careEmployeeMap;
                                            $rootScope.patientPopup.careTypes = careTypes;
                                            $rootScope.paginationLoading = false;
                                            if (editMode) {
                                                $rootScope.patientPopup.employees = $rootScope.patientPopup.careEmployeeMap[$rootScope.patientPopup.data.companyCareTypeId];
                                                if ($rootScope.patientPopup.data.employeeId) {
                                                    setTimeout(function () {
                                                        $("#employee").select2({val: $rootScope.patientPopup.data.employeeId});
                                                    }, 100);
                                                }
                                            }
                                        }).catch(function (data) {
                                            toastr.error(data.data);
                                        }).then(function () {
                                            $rootScope.unmaskLoading();
                                        });

                                    } else if (!patientObj) {
                                        $rootScope.paginationLoading = false;
                                        patientObj = {};
                                        $rootScope.unmaskLoading();
                                        toastr.error("Failed to retrieve patient.");
                                    } else if (patientObj && patientObj.patientCareTypeCollection && patientObj.patientCareTypeCollection.length === 0) {
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
                                    var obj = {action: ontimetest.eventTypes[data.eventType].toLowerCase(), subAction: id};
                                    EventTypeDAO.retrieveEventType(obj).then(function (res) {
                                        data = angular.copy(res);
                                        data.applyTo = "SINGLE";
                                        var a = moment(new Date(data.startDate));
                                        var diff = moment().diff(a, 'days');
                                        if (diff > 0) { // past date
                                            data.isEdited1 = true;
                                        }
                                        data.isEdited = true;
                                        $rootScope.patientPopup.data = angular.copy(data);
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
                if ($rootScope.patientPopup.patient && !$rootScope.patientPopup.isNew) {
                    $rootScope.patientPopup.patientChanged($rootScope.patientPopup.data.patientId, true);
                } else if ($rootScope.patientPopup.patient && $rootScope.patientPopup.isNew && !$rootScope.patientPopup.showPatient) {
                    $rootScope.patientPopup.patientChanged($rootScope.patientPopup.data.patientId, true, true);
                } else if (ctrl.calendarView == 'month') {
                    $rootScope.patientPopup.patientChanged(ctrl.viewPatient.id, false, true);
                }
            }
            $rootScope.maskLoading();
            var careTypes;
            var careEmployeeMap;
            patientObj = {};
            open();
        };
        EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.NURSING_CARE_COORDINATOR}).then(function (res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.nursingCareMap[res[i].id] = res[i].label;
                }
            }
        }).catch(function () {
            toastr.error("Failed to retrieve nursing care list.");
        });
        EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.STAFFING_COORDINATOR}).then(function (res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.staffCoordinatorMap[res[i].id] = res[i].label;
                }
            }
        }).catch(function () {
            toastr.error("Failed to retrieve staff coordinator list.");
        });
        InsurerDAO.retrieveAll().then(function (res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.insuranceProviderMap[res[i].id] = res[i].insuranceName;
                }
            }
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        $rootScope.openEditModal = function (patient, modal_id, modal_size, modal_backdrop)
        {
            PatientDAO.getPatientsForSchedule({patientIds: patient.id}).then(function (patients) {
                var patient = patients[0];
                $rootScope.selectPatientModel = $modal.open({
                    templateUrl: modal_id,
                    size: modal_size,
                    backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                    keyboard: false
                });
                $rootScope.selectPatientModel.patient = angular.copy(patient);
                $rootScope.selectPatientModel.patient.insuranceProviderName = ctrl.insuranceProviderMap[patient.insuranceProviderId];
                $rootScope.selectPatientModel.patient.nurseCaseManagerName = ctrl.nursingCareMap[patient.nurseCaseManagerId];
                $rootScope.selectPatientModel.patient.staffingCordinatorName = ctrl.staffCoordinatorMap[patient.staffingCordinatorId];
                if (patient.languagesSpoken != null && patient.languagesSpoken.length > 0) {
                    $rootScope.selectPatientModel.patient.languagesSpoken = patient.languagesSpoken.split(",");
                }
            });
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
        $rootScope.navigateToMonthPage = function (patient) {
            delete ctrl.monthPatient;
            $state.go('app.patient-calendar', {id: patient.id});
        };
        ctrl.retrievePatients();
        ctrl.retrieveAllPatients();
        ctrl.retrieveAllCoordinators();
    }

    angular.module('xenon.controllers').controller('PatientCalendarCtrl', ["Page", "PatientDAO", "$rootScope", "$debounce", "EmployeeDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", "$stateParams", "CareTypeDAO", "InsurerDAO", PatientCalendarCtrl]);
})();
