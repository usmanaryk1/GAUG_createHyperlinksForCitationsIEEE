(function () {
    function PatientCalendarCtrl(Page, PatientDAO, $rootScope, $debounce, EmployeeDAO, EventTypeDAO, $modal, $filter, $timeout, $state, $stateParams) {

        var ctrl = this;

        ctrl.patient_list = [];

        var timeFormat = 'HH:mm';

        Page.setTitle("Patient Calendar");

        ctrl.calendarView = 'week';

        if ($stateParams.id != '') {
            ctrl.calendarView = 'month';
        }

        ctrl.viewPatient;

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
            ctrl.retrievePatients();
        };

        ctrl.applySearch = function () {
            ctrl.pageNo = 1;
            $debounce(ctrl.retrievePatients, 500);
        };

        ctrl.resetFilters = function () {
            ctrl.searchParams = {limit: 10, skip: 0};
            ctrl.searchParams.availableStartDate = null;
            ctrl.searchParams.availableStartDate = null;
            $('#patientIds').select2('val', null);
            $('#positions').select2('val', null);
            $('#languages').select2('val', null);
            ctrl.applySearch();
        };

        ctrl.retrievePatients = function () {
            if (ctrl.pageNo > 1) {
                ctrl.searchParams.skip = (ctrl.pageNo-1) * ctrl.searchParams.limit;
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
            PatientDAO.getPatientsForSchedule(searchParams).then(function (res) {
                ctrl.patient_list = res;
                ctrl.count = $rootScope.totalRecords;
                if (!ctrl.viewPatient) {
                    ctrl.viewPatient = res[0];
                }
                if ($stateParams.id != '') {
                    var obj;
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
            ctrl.retrievePatients();
        };

        ctrl.getAllEvents = function (ids) {
            EventTypeDAO.retrieveBySchedule({patientIds: ids}).then(function (res) {
                delete res.$promise;
                delete res.$resolved;
                ctrl.events = res;
            });
        };

        ctrl.retrieveAllPatients = function () {
            PatientDAO.retrieveAll({subAction: 'active'}).then(function (res) {
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

        ctrl.savePatientPopupChanges = function (data) {
            $rootScope.maskLoading();
            var data1 = angular.copy(data);
            if (ctrl.calendarView == 'month') {
                data1.patientId = ctrl.viewPatient.id;
            }
            console.log("patient data :: " + JSON.stringify(data1));
            var obj = {action: data1.eventType, data: data1}
            if ($rootScope.patientPopup.isNew) {
                EventTypeDAO.saveEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $rootScope.patientPopup.close();
                    ctrl.loadEvents();
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
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
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
                }, 200);
                $rootScope.patientPopup = $modal.open({
                    templateUrl: modal_id,
                    size: modal_size,
                    backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                    keyboard: false
                });
                $rootScope.patientPopup.todayDate = new Date();
                $rootScope.patientPopup.calendarView = ctrl.calendarView;
                $rootScope.patientPopup.patientList = ctrl.patientList;
                $rootScope.patientPopup.reasons = ontimetest.patientReasons;
                $rootScope.patientPopup.employees = [];
                $rootScope.patientPopup.eventTypes = ontimetest.eventTypes;
                $rootScope.patientPopup.recurranceTypes = ontimetest.recurranceTypes;
                $rootScope.patientPopup.patient = angular.copy(patientObj);
                if (data == null) {
                    $rootScope.patientPopup.isNew = true;
                } else {
                    $rootScope.patientPopup.isNew = false;
                    $rootScope.patientPopup.data = data;
                    if (data.eventType != 'U')
                        $rootScope.patientPopup.data.applyTo = "SINGLE";
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                if (!angular.isDefined($rootScope.patientPopup.data)) {
                    $rootScope.patientPopup.data = {eventType: "S", recurranceType: "N", forLiveIn: false, startTime: currentTime, endTime: currentTime, startDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat)};
                }
                $rootScope.patientPopup.save = function () {
                    $timeout(function () {
                        var name = '#' + "popuppatient" + $rootScope.patientPopup.data.eventType.toLowerCase();
                        if ($(name)[0].checkValidity()) {
                            var a = moment(new Date($rootScope.patientPopup.data.startDate));
                            var b = moment(new Date($rootScope.patientPopup.data.endDate));
                            var diff = b.diff(a, 'days');
                            if (diff > 6) {
                                toastr.error("Date range should be no more of 7 days.");
                            } else {
                                if ($rootScope.patientPopup.data.eventType == 'U') {
                                    var start = new Date($rootScope.patientPopup.data.startDate).getDay();
                                    var end = new Date($rootScope.patientPopup.data.endDate).getDay();
                                    if (end < start) {
                                        toastr.error("Both dates must fall in same week.");
                                    } else {
                                        ctrl.savePatientPopupChanges($rootScope.patientPopup.data);
                                    }
                                } else {
                                    ctrl.savePatientPopupChanges($rootScope.patientPopup.data);
                                }
                            }
                        } else {
                            console.log("invalid form")
                        }
                    });
                };
                $rootScope.patientPopup.changed = function (form, event) {
                    if (event != 'repeat') {
                        var old = $rootScope.patientPopup.data.eventType;
                        $rootScope.patientPopup.data = {eventType: old, recurranceType: "N", startDate: $filter('date')($rootScope.patientPopup.todayDate, $rootScope.dateFormat)};
                        var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                        if (old == 'S') {
                            $rootScope.patientPopup.data.forLiveIn = false;
                            $rootScope.patientPopup.data.startTime = currentTime;
                            $rootScope.patientPopup.data.endTime = currentTime;
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
                            cbr_replace();
                        }, 200);
                    }
                };
                $rootScope.patientPopup.retrieveEmployeeBasedOnCare = function () {
                    delete $rootScope.patientPopup.data.employeeId;
                    $rootScope.patientPopup.employees = $rootScope.patientPopup.careEmployeeMap[$rootScope.patientPopup.data.companyCareTypeId];
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
                    EventTypeDAO.delete({subAction: id, action: ontimetest.eventTypes[obj.eventType].toLowerCase(), applyTo: obj.applyTo}).then(function (res) {
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
                        delete $rootScope.patientPopup.data.companyCareTypeId;
                        delete $rootScope.patientPopup.data.employeeId;
                        $rootScope.patientPopup.carePatientMap = {};
                        $rootScope.patientPopup.careTypes = [];
                    }
                    if (!($rootScope.patientPopup.data.eventType != 'S' && !editMode && !viewMode)) {
                        $rootScope.paginationLoading = true;
                        PatientDAO.getPatientsForSchedule({patientIds: patientId}).then(function (res) {
                            patientObj = res[0];
                            if (ctrl.calendarView == 'month' || !$rootScope.patientPopup.isNew) {
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
                                            careTypesSelected.push(patientObj.patientCareTypeCollection[i].insuranceCareTypeId);
                                            if (str.length > 0) {
                                                str = str + ",";
                                            }
                                            str = str + patientObj.patientCareTypeCollection[i].insuranceCareTypeId.id;
                                        }
                                        careTypes = careTypesSelected;
                                        EmployeeDAO.retrieveAll({companyCareTypes: str, subAction: "active"}).then(function (res) {
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
                                        $rootScope.employeePopup.showLoadingImage = false;
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
                                    data.applyTo = "SINGLE";
                                    $rootScope.patientPopup.data = angular.copy(data);
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
                if ($rootScope.patientPopup.patient && !$rootScope.patientPopup.isNew) {
                    $rootScope.patientPopup.patientChanged($rootScope.patientPopup.data.patientId, true);
                }
                if (ctrl.calendarView == 'month') {
                    $rootScope.patientPopup.patientChanged(ctrl.viewPatient.id, false, true);
                }
            }
            $rootScope.maskLoading();
            var careTypes;
            var careEmployeeMap;
            patientObj = {};
            open();
        };
        $rootScope.openEditModal = function (patient, modal_id, modal_size, modal_backdrop)
        {
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
        };
        $rootScope.navigateToMonthPage = function (patient) {
            $state.go('app.patient-calendar', {id: patient.id});
        };
        ctrl.retrievePatients();
        ctrl.retrieveAllPatients();
        ctrl.retrieveAllCoordinators();
    }

    angular.module('xenon.controllers').controller('PatientCalendarCtrl', ["Page", "PatientDAO", "$rootScope", "$debounce", "EmployeeDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", "$stateParams", PatientCalendarCtrl]);
})();
