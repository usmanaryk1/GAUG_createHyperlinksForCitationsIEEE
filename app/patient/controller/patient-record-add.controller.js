(function () {
    function PatientRecordAddCtrl($rootScope, $modalInstance, PatientRecordDAO, $state) {
        var ctrl = this;

        this.options = [
            { option: "Nursing Assessment", value: "Nursing_Assessment" },
            { option: "Medication Reconciliation", value: "Medication_Reconciliation" },
            { option: "Progress Note", value: "Progress_Note" }];

        ctrl.save = function () {
            var request = { "type": ctrl.type.value, "expiryDate": ctrl.expiry };
            request.patientId = $modalInstance.id;
            $rootScope.maskLoading();

            PatientRecordDAO.saveRecord(request).then(function (res) {
                toastr.success("Patient Record Added");
                if (ctrl.type.value == 'Nursing_Assessment')
                    $state.go('app.edit_patient', { id: res.patientId, recordType: res.type });
                if (ctrl.type.value == 'Medication_Reconciliation')
                    $state.go('app.medical_reconciliation', { id: res.patientId});
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.error("Failed to retrieve patient");
            }).then(function () {
                $rootScope.unmaskLoading();
            });

            $modalInstance.close();
        };
        ctrl.close = function () {
            $modalInstance.close();
        };

    }
    ;
    angular.module('xenon.controllers').controller('PatientRecordAddCtrl', ["$rootScope", "$modalInstance", "PatientRecordDAO", "$state", PatientRecordAddCtrl]);
})();