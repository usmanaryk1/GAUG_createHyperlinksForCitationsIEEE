(function () {
    function ComplaintInfoCtrl(complaint, $rootScope, $modal, $modalInstance, PatientDAO) {
        var ctrl = this;
        ctrl.complaint = complaint;

        console.log(complaint);


        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('ComplaintInfoCtrl', ["complaint", "$rootScope", "$modal", "$modalInstance", "PatientDAO", ComplaintInfoCtrl]);
})();