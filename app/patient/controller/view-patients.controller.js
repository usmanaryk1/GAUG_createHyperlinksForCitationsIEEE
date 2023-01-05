(function() {
    function ViewPatientsCtrl($rootScope, $http) {
        var ctrl = this;
        this.patient = {Gender: 'M'};
        ctrl.savePatient = savePatientData;
        function savePatientData() {
            if ($('#add_patient_form')[0].checkValidity()) {
                alert('Patient Object : ' + JSON.stringify(ctrl.patient));
            }
        }
        ;
    }
    ;
    angular.module('xenon.controllers').controller('ViewPatientsCtrl', ["$rootScope", "$http", ViewPatientsCtrl]);
})();