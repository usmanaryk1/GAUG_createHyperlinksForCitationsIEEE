
(function () {
    function ProgressNotes($rootScope, $formService, PatientDAO, $state, $http, $sce, $window, $timeout, $scope) {
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
                console.log(res);
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
    angular.module('xenon.controllers').controller('ProgressNotes', ["$rootScope", "$formService", "PatientDAO", "$state", "$http", "$sce", "$window", "$timeout", "$scope", ProgressNotes]);
})();
