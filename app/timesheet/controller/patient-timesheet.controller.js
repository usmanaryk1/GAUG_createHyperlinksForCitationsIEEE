(function() {
    function PatientTimeSheetCtrl($scope, $rootScope, TimesheetDAO, PatientDAO, $modal, $timeout, EmployeeDAO, InsurerDAO, $location) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.searchParams = {};
        ctrl.companyCode = ontimetest.company_code;
        ctrl.criteriaSelected = false;
        ctrl.viewRecords = 10;
        ctrl.nursingCareMap = {};
        ctrl.staffCoordinatorMap = {};
        ctrl.insuranceProviderMap = {};
        ctrl.patientList = [];
        ctrl.patientIdMap = {};
        EmployeeDAO.retrieveByPosition({'position': 'nc'}).then(function(res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.nursingCareMap[res[i].id] = res[i].label;
                }
            }
        }).catch(function() {
            toastr.error("Failed to retrieve nursing care list.");
        });
        EmployeeDAO.retrieveByPosition({'position': 'a'}).then(function(res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.staffCoordinatorMap[res[i].id] = res[i].label;
                }
            }
        }).catch(function() {
            toastr.error("Failed to retrieve staff coordinator list.");
        });
        InsurerDAO.retrieveAll().then(function(res) {
            if (res.length !== 0) {
                for (var i = 0; i < res.length; i++) {
                    ctrl.insuranceProviderMap[res[i].id] = res[i].insuranceName;
                }
            }
        }).catch(function() {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            $('#sboxit-2').select2('val', null);
            ctrl.selectedPatient = null;
            ctrl.searchParams.patientId = null;
            ctrl.criteriaSelected = false;
            ctrl.timesheetList = [];
            ctrl.rerenderDataTable();
        };
        ctrl.rerenderDataTable = function() {
            ctrl.datatableObj = {};
            var timesheetList = angular.copy(ctrl.timesheetList);
            ctrl.timesheetList = [];
            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.timesheetList = timesheetList;
            });
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchParams.patientId && ctrl.searchParams.patientId !== null) {
                if (!ctrl.searchParams.startDate || ctrl.searchParams.startDate == "") {
                    ctrl.searchParams.startDate = null;
                }
                if (!ctrl.searchParams.endDate || ctrl.searchParams.endDate == "") {
                    ctrl.searchParams.endDate = null;
                }
                if (ctrl.searchParams.startDate !== null) {
                    ctrl.criteriaSelected = true;
                    ctrl.retrieveTimesheet();
                } else {
                    ctrl.criteriaSelected = false;
                    ctrl.timesheetList = [];
                    ctrl.rerenderDataTable();
                }
            } else {
                ctrl.timesheetList = [];
                ctrl.criteriaSelected = false;
                ctrl.rerenderDataTable();
            }
//            ctrl.datatableObj.fnDraw();

        };
        ctrl.retrieveTimesheet = function() {
            $rootScope.maskLoading();
            if (ctrl.searchParams.patientId !== null) {
                ctrl.selectedPatient = ctrl.patientIdMap[ctrl.searchParams.patientId];
            }
            ctrl.dataRetrieved = false;
            if (ctrl.searchParams.patientId != null && ctrl.searchParams.startDate != null) {
                $location.search({id: ctrl.searchParams.patientId, from: ctrl.searchParams.startDate, to: ctrl.searchParams.endDate});
            }
            TimesheetDAO.retrievePatientTimeSheet(ctrl.searchParams).then(function(res) {
                ctrl.dataRetrieved = true;
//                showLoadingBar({
//                    delay: .5,
//                    pct: 100,
//                    finish: function() {
//                        if (res) {
//                            
//                        }
//                    }
//                }); // showLoadingBar
                ctrl.timesheetList = res;
                angular.forEach(ctrl.timesheetList, function(obj) {
                    obj.roundedPunchInTime = Date.parse(obj.roundedPunchInTime);
                    obj.roundedPunchOutTime = Date.parse(obj.roundedPunchOutTime);
                });
                ctrl.rerenderDataTable();
            }).catch(function() {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
//                ctrl.timesheetList = ontimetest.employeeTimesheet;
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };

        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveAll({status: 'active'}).then(function(res) {
                ctrl.patientList = res;
                ctrl.patientIdMap = {};
                for (var i = 0; i < res.length; i++) {
                    ctrl.patientIdMap[res[i].id] = res[i];
                }
                var params = $location.search();
                if (params != null && params.id != null) {
                    ctrl.searchParams.patientId = Number(params.id);
                    $timeout(function() {
                        $("#sboxit-2").select2("val", params.id);
                    }, 300);
                    if (params.from != null) {
                        ctrl.searchParams.startDate = params.from;
                    }
                    if (params.to != null) {
                        ctrl.searchParams.endDate = params.to;
                    }
                    ctrl.filterTimesheet();
                }

            }).catch(function(data, status) {
//                ctrl.patientList = ontimetest.patients;
            });
        }
        ;

        ctrl.openTaskListModal = function(modal_id, modal_size, modal_backdrop, tasks)
        {
            ctrl.taskListModalOpen = true;
            $rootScope.taskListModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
//            $rootScope.taskListModal.taskList = [{label: "Slicing", value: false}, {label: "WooCommerce", value: true}, {label: "Programming", value: false}, {label: "SEO Optimize", value: true}];
            $rootScope.taskListModal.taskList = tasks;

        };

        ctrl.openDeleteModal = function(punchObj, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePunchModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deletePunchModal.punchObj = punchObj;

            $rootScope.deletePunchModal.delete = function(punchObj) {
                $rootScope.maskLoading();
                TimesheetDAO.delete({id: punchObj.id}).then(function(res) {
                    var length = ctrl.timesheetList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.timesheetList[i].id === punchObj.id) {
                            ctrl.timesheetList.splice(i, 1);
                            break;
                        }
                    }
                    ctrl.rerenderDataTable();
                    toastr.success("Punch record deleted.");
                    $rootScope.deletePunchModal.close();
                }).catch(function(data, status) {
                    toastr.error("Failed to delete punch record.");
                    $rootScope.deletePunchModal.close();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            };

        };
        ctrl.viewPatient = function(patientId) {
            $rootScope.maskLoading();
            PatientDAO.get({id: patientId}).then(function(res) {
                ctrl.openEditModal(res, 'modal-5');
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };

        ctrl.openEditModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectPatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.selectPatientModel.patient = patient;
            $rootScope.selectPatientModel.patient.insuranceProviderName = ctrl.insuranceProviderMap[patient.insuranceProviderId];
            $rootScope.selectPatientModel.patient.nurseCaseManagerName = ctrl.nursingCareMap[patient.nurseCaseManagerId];
            $rootScope.selectPatientModel.patient.staffingCordinatorName = ctrl.staffCoordinatorMap[patient.staffingCordinatorId];
            if (patient.languagesSpoken != null && patient.languagesSpoken.length > 0) {
                $rootScope.selectPatientModel.patient.languagesSpoken = patient.languagesSpoken.split(",");
            }
        };

    }
    ;
    angular.module('xenon.controllers').controller('PatientTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "PatientDAO", "$modal", "$timeout", "EmployeeDAO", "InsurerDAO", "$location", PatientTimeSheetCtrl]);
})();