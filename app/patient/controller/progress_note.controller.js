
(function () {
    function ProgressNotesCtrl($rootScope, $formService, PatientDAO, $state, $http, $sce, $window, $timeout, $scope) {
        'use strict';
        var ctrl = this;
        ctrl.patientName;
        ctrl.patientId = $state.params.id

        ctrl.progressNoteForm = {
            assessmentMode: '',
            assessmentType: '',
            progressNote: ''
        }



        ctrl.submitForm = function () {
            if($('#progress_note_form')[0].checkValidity()){
                // $state.go('app.patient_records_patient', { patientId: ctrl.patientId });
                console.log(ctrl.progressNoteForm);
            }
        }


        ctrl.pageInitCall = pageInit;



        ctrl.dataInit = function(){
            ctrl.progressNoteForm.assessmentMode = 'field'
            $formService.resetRadios()
        }

        function pageInit() {
            $rootScope.maskLoading();
            PatientDAO.get({ id: $state.params.id }).then(function (res) {
                ctrl.patient = res;
                ctrl.patientName = res.fName
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                });
                toastr.error("Failed to retrieve patient");
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        }


        ctrl.pageInitCall()


    };
    angular.module('xenon.controllers').controller('ProgressNotesCtrl', ["$rootScope", "$formService", "PatientDAO", "$state", "$http", "$sce", "$window", "$timeout", "$scope", ProgressNotesCtrl]);
})();
