(function () {
    function PatientRecordAddCtrl($rootScope, $modalInstance, PatientRecordDAO, $state) {
        var ctrl = this;

        this.recordOptions = angular.copy(ontime_data.patientRecords)

        ctrl.save = function () {
            var request = { "type": ctrl.type.value, "expiryDate": ctrl.expiry };
            request.patientId = $modalInstance.id;
            $rootScope.maskLoading();

            PatientRecordDAO.saveRecord(request).then(function (res) {
                toastr.success("Patient Record Added");
                if (ctrl.type.value == 'Nursing_Assessment')
                    $state.go('app.edit_patient', { id: res.patientId, recordType: res.type });
                if (ctrl.type.value == 'Medication_Reconciliation')
                    $state.go('app.medication_reconciliation', { id: res.patientId });
                if (ctrl.type.value == 'Progress_Note')
                    $state.go('app.progress_note', { id: res.patientId })
                if (ctrl.type.value == 'Medical_Orders')
                    $state.go('app.medical_orders', { id: res.patientId })
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.error("Failed to retrieve patient data");
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