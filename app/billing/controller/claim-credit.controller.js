/* global ontime_data, _ */

(function () {
    function ClaimCreditCtrl($modalInstance, $rootScope, BillingDAO) {
        var ctrl = this;

        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        ctrl.calledOnce = false;
        ctrl.credit = {};
        ctrl.availableCredit = 0;
        ctrl.getClaim = function () {
            if (ctrl.claimNumber) {
                ctrl.credit = {};
                ctrl.availableCredit = 0;
                $rootScope.maskLoading();
                BillingDAO.getClaimById({paramId: ctrl.claimNumber}).then(function (claim) {                    
                    console.log("claim", claim);
                    ctrl.credit = {claimId: claim.id, usedAmount: 0};
                    ctrl.claim = angular.copy(claim);
                    ctrl.availableCredit = ctrl.claim.paidAmount - ctrl.claim.totalCosts;
                    _.each(claim.creditUsages,function(credit){
                        ctrl.availableCredit = ctrl.availableCredit - credit.usedAmount;
                    });
                    ctrl.availableCredit.toFixed(2);
                }).catch(function (err) {
                    console.log("No claim found",err);
                    toastr.error("Error retrieveing claim.");
                }).then(function(){
                    $rootScope.unmaskLoading();
                });
            } else {
                toastr.error("Claim number is required.");
            }            
        };

        ctrl.save = function () {
            if (ctrl.credit.claimId && ctrl.credit.usedAmount && (parseFloat(ctrl.credit.usedAmount) <= ctrl.availableCredit)) {
                ctrl.credit.usedAmount = parseFloat(ctrl.credit.usedAmount);
                $modalInstance.close(ctrl.credit);
            } else {
                toastr.error("Used Amount is required.");
            }            
        };
        
        ctrl.close = function () {
            $modalInstance.dismiss();
        };
    }
    ;
    angular.module('xenon.controllers').controller('ClaimCreditCtrl', ["$modalInstance", "$rootScope", "BillingDAO", ClaimCreditCtrl]);
})();