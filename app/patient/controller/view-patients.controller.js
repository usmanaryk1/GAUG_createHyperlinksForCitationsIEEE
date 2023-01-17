(function() {
    function ViewPatientsCtrl(PatientDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        $rootScope.selectPatientModel = {};
        if ($stateParams.status !== 'active' && $stateParams.status !== 'inactive' && $stateParams.status !== 'all') {
            $state.transitionTo(ontimetest.defaultState);
        } else {
            ctrl.viewType = $stateParams.status;
        }
        ctrl.retrievePatients = retrievePatientsData;
        ctrl.edit = edit;
        
        function retrievePatientsData() {
            PatientDAO.retrieveAll().then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        if (res) {
                            ctrl.patientList = res;
                        }
                    }
                }); // showLoadingBar

            }).catch(function(data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        
                    }
                }); // showLoadingBar
                ctrl.patientList = ontimetest.patients;
            });
        }
        
        function edit(patient){
            $state.go('app.patient.tab1', {id: patient.id});
        }
        
        ctrl.retrievePatients();
        ctrl.openEditModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectPatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectPatientModel.patient=patient;

        };
        
    }
    ;
    angular.module('xenon.controllers').controller('ViewPatientsCtrl', ["PatientDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewPatientsCtrl]);
})();