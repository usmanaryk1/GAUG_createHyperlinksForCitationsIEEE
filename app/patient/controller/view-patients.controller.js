(function () {
    function ViewPatientsCtrl(PatientDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
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

        function retrievePatientsData() {
            PatientDAO.retrieveAll({status: ctrl.viewType}).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }

                }); // showLoadingBar
                if (res) {
                    ctrl.patientList = res;
                    if(res.length ===0){
                        toastr.error("No data in the system.");
                    }
                }

            }).catch(function (data, status) {
                toastr.error("Failed to retrieve patients.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
//                ctrl.patientList = ontimetest.patients;
            });
        }

        function edit(patient) {
            $state.go('app.patient.tab1', {id: patient.id});
        }

        ctrl.retrievePatients();
        ctrl.openEditModal = function (patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectPatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectPatientModel.patient = patient;

        };

        ctrl.openDeleteModal = function (patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
            });
            $rootScope.deletePatientModel.patient = patient;

            $rootScope.deletePatientModel.delete = function (patient) {
                PatientDAO.delete({id: patient.id}).then(function (res) {
                    var length = ctrl.patientList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.patientList[i].id === patient.id) {
                            ctrl.patientList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Patient deleted.");
                    $rootScope.deletePatientModel.close();
                }).catch(function (data, status) {
                    toastr.error("Patient cannot be deleted.");
                    $rootScope.deletePatientModel.close();
                });
            };
        };

        ctrl.openDischargeModal = function (patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.dischargePatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });

            $rootScope.dischargePatientModel.patient = patient;

            $rootScope.dischargePatientModel.discharge = function (patient) {
                PatientDAO.discharge({id: patient.id}).then(function (res) {
                    var length = ctrl.patientList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.patientList[i].id === patient.id) {
                            ctrl.patientList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Patient discharged.");
                    $rootScope.dischargePatientModel.close();
                }).catch(function (data, status) {
                    toastr.error("Patient cannot be discharged.");
                    $rootScope.dischargePatientModel.close();
                });
            };
        };

    }
    ;
    angular.module('xenon.controllers').controller('ViewPatientsCtrl', ["PatientDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewPatientsCtrl]);
})();
