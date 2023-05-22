(function () {
    function ViewBenefitsCtrl(Page) {
        var ctrl = this;
        Page.setTitle("View Benefits");

        ctrl.benefitList = [{packageName:'Sick & Accrual',status:'a'},{packageName:'Personal & Vacation',status:'i'}];


    }
    ;
    angular.module('xenon.controllers').controller('ViewBenefitsCtrl', ["Page", ViewBenefitsCtrl]);
})();