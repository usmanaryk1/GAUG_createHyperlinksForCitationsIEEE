(function () {
    function ComplaintInfoCtrl(complaintId, $rootScope, $modal, $modalInstance, PatientDAO) {
        var ctrl = this;
        ctrl.complaint = {};

        ctrl.complaint.name = "Complaint"


        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('ComplaintInfoCtrl', ["complaintId", "$rootScope", "$modal", "$modalInstance", "PatientDAO", ComplaintInfoCtrl]);
})();