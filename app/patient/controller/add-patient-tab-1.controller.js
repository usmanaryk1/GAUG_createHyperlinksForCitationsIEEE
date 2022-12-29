(function() {
    function AddPatientTab1Ctrl($rootScope, $http) {
        var ctrl = this;
        this.patient1 = {'Gender': 'M'};
        ctrl.savePatientTab1 = savePatientTab1Data;
        function savePatientTab1Data() {
            if ($('#add_patient_tab_1_form')[0].checkValidity()) {
                alert('Patient Object : ' + JSON.stringify(ctrl.patient));
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddPatientTab1Ctrl', ["$rootScope", "$http", AddPatientTab1Ctrl]);
})();