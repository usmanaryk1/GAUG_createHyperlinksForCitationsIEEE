(function () {
    function BenefitModalCtrl(benefitObj, $modalInstance, $timeout) {
        var ctrl = this;
        if (benefitObj != null) {
            ctrl.selectedBenefitObj = benefitObj[0];
            ctrl.modalTitle = ontime_data.benefitMap[ctrl.selectedBenefitObj];
        }
        ctrl.close = function () {
            $modalInstance.close();
        };
        $timeout(function () {
            cbr_replace();
        });
    }
    ;
    angular.module('xenon.controllers').controller('BenefitModalCtrl', ["benefitObj", "$modalInstance", "$timeout", BenefitModalCtrl]);
})();