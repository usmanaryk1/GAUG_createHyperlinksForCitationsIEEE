(function() {
    function ViewPatientsCtrl(patientDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        if ($stateParams.status != 'active' && $stateParams.status != 'inactive' && $stateParams.status != 'all') {
            $state.transitionTo('login');
        } else {
            ctrl.viewType = $stateParams.status;
        }
        this.patient = {Gender: 'M'};
        ctrl.retrievePatients = retrievePatientsData;
        ctrl.edit = edit;
        retrievePatientsData();
        function retrievePatientsData() {
            patientDAO.retrieveAll().then(function(res) {
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
        ;
        ctrl.openEditModal = function(patient, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectPatientModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectPatientModel.patient=patient;

        };
        function edit(patient){
            alert(JSON.stringify(patient));
            ctrl.selectedPatient = patient;
            $rootScope.openModal('modal-5');
        }
    }
    ;
    angular.module('xenon.controllers').controller('ViewPatientsCtrl', ["patientDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewPatientsCtrl]);
})();