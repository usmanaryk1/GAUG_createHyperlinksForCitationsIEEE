(function() {
    function AddPatientCtrl($rootScope, $http) {
        var ctrl = this;
        this.patient = {Gender: 'M'};
        ctrl.savePatient = savePatientData;
        function savePatientData() {
            if ($('#add_patient_form')[0].checkValidity()) {
                console.log('Patient Object : ' + JSON.stringify(ctrl.patient));
            }
        }
        ;
    }
    ;
    angular.module('xenon.controllers').controller('AddPatientCtrl', ["$rootScope", "$http", AddPatientCtrl]);
})();