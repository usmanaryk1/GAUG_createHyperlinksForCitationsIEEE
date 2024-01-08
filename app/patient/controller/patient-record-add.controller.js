(function () {
    function PatientRecordAddCtrl($rootScope, $modalInstance, PatientRecordDAO, $state) {
        var ctrl = this;

        this.recordOptions = angular.copy(ontime_data.patientRecords)
        console.log("ontime_data", ontime_data, ontime_data.patientRecords);
        ctrl.save = function () {
            var request = { "type" : ctrl.type.value , "expiryDate" : ctrl.expiry};
            request.patientId=$modalInstance.id;
            $rootScope.maskLoading();

            PatientRecordDAO.saveRecord(request).then(function (res) {
                toastr.success("Patient Record Added");
               
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
    angular.module('xenon.controllers').controller('PatientRecordAddCtrl', [ "$rootScope", "$modalInstance", "PatientRecordDAO", "$state", PatientRecordAddCtrl]);
})();