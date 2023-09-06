(function () {
    var openRejectModalController = function ($modalInstance, mode, claim) {
        var ctrl = this;
        ctrl.mode = mode;
        ctrl.claim = claim;
        ctrl.codes = ["CO-196","CO-50","CO-45","OA-96","CO- 27","197","192","160","109","45","29","27","18","15","N522","N372","N362","N52"];
        ctrl.details = {claimId: claim.id, status: (claim.isRejected === true ? 'open' : 'reject')};
        ctrl.ok = function () {
            if ($('#openRejectModal')[0].checkValidity()) {
                $modalInstance.close(ctrl.details);
            }
        };
        ctrl.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    angular.module('xenon.controllers').controller('OpenRejectModalController', ['$modalInstance', 'mode', 'claim', openRejectModalController]);
})();