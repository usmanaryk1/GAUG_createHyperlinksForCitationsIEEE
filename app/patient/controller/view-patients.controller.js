(function() {
    function ViewPatientsCtrl(PatientDAO, $rootScope, $stateParams, $state, $modal, $timeout, EmployeeDAO, InsurerDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        $rootScope.selectPatientModel = {};
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        if ($stateParams.status !== 'active' && $stateParams.status !== 'discharged' && $stateParams.status !== 'all') {
            $state.transitionTo(ontimetest.defaultState);
        } else {
            ctrl.viewType = $stateParams.status;
        }
        ctrl.retrievePatients = retrievePatientsData;
        ctrl.edit = edit;
        ctrl.nursingCareMap = {};
        ctrl.staffCoordinatorMap = {};
        ctrl.insuranceProviderMap = {};

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
        function retrievePatientsData() {
            $rootScope.maskLoading();
            PatientDAO.retrieveAll({status: ctrl.viewType}).then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }

                }); // showLoadingBar
                if (res) {
                    ctrl.patientList = res;
                    if (res.length === 0) {
                        toastr.error("No data in the system.");
                    }
                }

            }).catch(function(data, status) {
                toastr.error("Failed to retrieve patients.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
//                ctrl.patientList = ontimetest.patients;
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        }

        function edit(patient) {
            $state.go('app.patient.tab1', {id: patient.id});
        }

        ctrl.retrievePatients();
        ctrl.openEditModal = function(patient, modal_id, modal_size, modal_backdrop)
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

        ctrl.openDeleteModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deletePatientModel.patient = patient;

            $rootScope.deletePatientModel.delete = function(patient) {
                $rootScope.maskLoading();
                PatientDAO.delete({id: patient.id}).then(function(res) {
                    var length = ctrl.patientList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.patientList[i].id === patient.id) {
                            ctrl.patientList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Patient deleted.");
                    ctrl.rerenderDataTable();
                    $rootScope.deletePatientModel.close();
                }).catch(function(data, status) {
                    toastr.error(data.data);
                    $rootScope.deletePatientModel.close();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            };
        };

        ctrl.openDischargeModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.dischargePatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });

            $rootScope.dischargePatientModel.patient = patient;

            $rootScope.dischargePatientModel.discharge = function(patient) {
                $rootScope.maskLoading();
                PatientDAO.changestatus({id: patient.id, status: 'discharged'}).then(function(res) {
                    var length = ctrl.patientList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.patientList[i].id === patient.id) {
                            if (ctrl.viewType !== 'all') {
                                ctrl.patientList.splice(i, 1);
                            } else {
                                ctrl.patientList[i].status = 'd';
                            }
                            break;
                        }
                    }
                    toastr.success("Patient discharged.");
                    ctrl.rerenderDataTable();
                    $rootScope.dischargePatientModel.close();
                }).catch(function(data, status) {
                    toastr.error("Patient cannot be discharged.");
                    $rootScope.dischargePatientModel.close();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            };
        };

        ctrl.openReadmitModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.readmitPatientModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });

            $rootScope.readmitPatientModal.patient = patient;

            $rootScope.readmitPatientModal.readmit = function(patient) {
                PatientDAO.changestatus({id: patient.id, status: 'active'}).then(function(res) {
                    var length = ctrl.patientList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.patientList[i].id === patient.id) {
                            if (ctrl.viewType !== 'all') {
                                ctrl.patientList.splice(i, 1);
                            } else {
                                ctrl.patientList[i].status = 'a';
                            }
                            break;
                        }
                    }
                    toastr.success("Patient readmitted.");
                    ctrl.rerenderDataTable();
                    $rootScope.readmitPatientModal.close();
                }).catch(function(data, status) {
                    toastr.error("Patient cannot be readmitted.");
                    $rootScope.readmitPatientModal.close();
                });
            };
        };

        ctrl.rerenderDataTable = function() {
            var pageInfo = ctrl.datatableObj.page.info();
            var patientList = angular.copy(ctrl.patientList);
            ctrl.patientList = [];
            $("#example-4_wrapper").remove();
            $timeout(function() {
                ctrl.patientList = patientList;
                $timeout(function(){
                    var pageNo=Number(pageInfo.page);
                    if(ctrl.datatableObj.page.info().pages<=pageInfo.page){
                        pageNo--;
                    }
                    ctrl.datatableObj.page(pageNo).draw(false);
                },20);                
            });
        };

        ctrl.getLanguagesFromCode = function(languageCodes) {
            if (languageCodes != null && languageCodes.length > 0) {
                languageCodes = languageCodes.split(",");
                var languageToDisplay = "";
                angular.forEach(languageCodes, function(code, index) {
                    languageToDisplay += $rootScope.languages[code];
                    if (index < languageCodes.length - 1) {
                        languageToDisplay += ", ";
                    }
                });
                return languageToDisplay;
            } else {
                return "N/A";
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ViewPatientsCtrl', ["PatientDAO", "$rootScope", "$stateParams", "$state", "$modal", "$timeout", "EmployeeDAO", "InsurerDAO", ViewPatientsCtrl]);
})();