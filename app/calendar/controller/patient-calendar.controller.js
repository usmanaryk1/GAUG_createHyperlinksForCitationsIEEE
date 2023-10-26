(function () {
    function PatientCalendarCtrl(Page, PatientDAO, $rootScope, $debounce, EmployeeDAO, EventTypeDAO, $modal, $filter, $timeout, $state) {
        var ctrl = this;
        ctrl.patient_list = [];
        var timeFormat = 'HH:mm';
        Page.setTitle("Calendar");
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
                ctrl.searchParams.skip = ctrl.pageNo * ctrl.searchParams.limit;
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
                ctrl.totalRecords = $rootScope.totalRecords;
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
            data1.startDate = moment(new Date(data1.startDate)).format($rootScope.patientPopup.dateFormat);
            data1.endDate = moment(new Date(data1.endDate)).format($rootScope.patientPopup.dateFormat);
            console.log("patient data :: " + JSON.stringify(data1));
            var obj = {action: data1.eventType, data: data1}
            if ($rootScope.patientPopup.isNew) {
                EventTypeDAO.saveEventType(obj).then(function (res) {
                    toastr.success("Saved successfully.");
                    $state.go('app.patient-calendar', {id: res.id});
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
                    $state.go('app.employee.tab2', {id: res.id});
                }).catch(function (data) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.openModalPatient = function (data1, modal_id, modal_size, modal_backdrop)
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
                $rootScope.patientPopup.calendarView = ctrl.calendarView;
                $rootScope.patientPopup.patientList = ctrl.patientList;
                $rootScope.patientPopup.dateFormat = "MM/DD/YYYY";
                $rootScope.patientPopup.reasons = ontimetest.reasons;
                $rootScope.patientPopup.employees = [];
                $rootScope.patientPopup.eventTypes = ontimetest.eventTypes;
                $rootScope.patientPopup.recurranceTypes = ontimetest.recurranceTypes;
                $rootScope.patientPopup.patient = angular.copy(patientObj);
                if (data1 == null) {
                    $rootScope.patientPopup.isNew = true;
                } else {
                    $rootScope.patientPopup.isNew = false;
                    $rootScope.patientPopup.data = data1;
                    $rootScope.patientPopup.patient = angular.copy(data1.patient);
                    if (data1.eventType != 'U')
                        $rootScope.patientPopup.data.applyTo = "DOW";
                }
                //to make the radio buttons selected, theme bug
                setTimeout(function () {
                    cbr_replace();
                }, 100);

                var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                if (!angular.isDefined($rootScope.patientPopup.data)) {
                    $rootScope.patientPopup.data = {eventType: "S", recurranceType: "N", forLiveIn: false, startTime: currentTime, endTime: currentTime};
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
                                ctrl.savePatientPopupChanges($rootScope.patientPopup.data);
                            }
                        } else {
                            console.log("invalid form")
                        }
                    });
                };
                $rootScope.patientPopup.changed = function (event) {
                    if (event != 'repeat') {
                        var old = $rootScope.patientPopup.data.eventType;
                        $rootScope.patientPopup.data = {eventType: old, recurranceType: "N"};
                        var currentTime = $filter('date')(new Date().getTime(), timeFormat).toString();
                        if (old == 'S') {
                            $rootScope.patientPopup.data.forLiveIn = false;
                            $rootScope.patientPopup.data.startTime = currentTime;
                            $rootScope.patientPopup.data.endTime = currentTime;
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
                        }
                        if (old == 'U') {
                            $rootScope.patientPopup.data.isPaid = false;
                        }
                        setTimeout(function () {
                            cbr_replace();
                        }, 100);
                    }
                };
                $rootScope.patientPopup.retrieveEmployeeBasedOnCare = function () {
                    delete $rootScope.patientPopup.data.employeeId;
                    $rootScope.patientPopup.employees = $rootScope.patientPopup.careEmployeeMap[$rootScope.patientPopup.data.companyCareTypeId];
                };
                if ($rootScope.patientPopup.patient && !$rootScope.patientPopup.isNew) {
                    $rootScope.patientPopup.employees = $rootScope.patientPopup.careEmployeeMap[$rootScope.patientPopup.data.companyCareTypeId];
                }
                $rootScope.patientPopup.patientChanged = function (patientId) {
                    delete $rootScope.patientPopup.data.companyCareTypeId;
                    delete $rootScope.patientPopup.data.employeeId;
                    $rootScope.patientPopup.carePatientMap = {};
                    $rootScope.patientPopup.careTypes = [];
                    PatientDAO.getPatientsForSchedule({patientIds: patientId}).then(function (res) {
                        patientObj = res[0];
                        if (ctrl.calendarView == 'month') {
                            $rootScope.patientPopup.patient = angular.copy(patientObj);
                        }
                    }).catch(function (data, status) {
                        toastr.error("Failed to retrieve patient.");
                    }).then(function () {
                        function open1() {

                            // no need to retrieve patient object if you already have, just get all careTypes of patient's insuranceProviderId
                            $rootScope.maskLoading();
                            if (patientObj && patientObj.patientCareTypeCollection) {
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
                                }).catch(function (data) {
                                    toastr.error(data.data);
                                }).then(function () {
                                    $rootScope.unmaskLoading();
                                });
                            } else if (!patientObj) {
                                patientObj = {};
                                $rootScope.unmaskLoading();
                                toastr.error("Failed to retrieve patient.");
                            }
                        }
                        if (data1 != null) {
                            var obj = {action: ontimetest.eventTypes[data1.eventType].toLowerCase(), subAction: data1.id};
                            EventTypeDAO.retrieveEventType(obj).then(function (res) {
                                data1 = angular.copy(res);
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
                if (ctrl.calendarView == 'month') {
                    //static id for month view...change it later
                    $rootScope.patientPopup.patientChanged(2);
                }
            }
            $rootScope.maskLoading();
            var careTypes;
            var careEmployeeMap;
            patientObj = {};
            open();
        }

        ctrl.retrievePatients();
        ctrl.retrieveAllPatients();
        ctrl.retrieveAllCoordinators();
    }

    angular.module('xenon.controllers').controller('PatientCalendarCtrl', ["Page", "PatientDAO", "$rootScope", "$debounce", "EmployeeDAO", "EventTypeDAO", "$modal", "$filter", "$timeout", "$state", PatientCalendarCtrl]);
})();
