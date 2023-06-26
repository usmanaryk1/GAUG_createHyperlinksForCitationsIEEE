/* global ontime_data, _, appHelper */

(function () {
    function ClaimCreditCtrl(creditUsages, $modal, $modalInstance, $rootScope, BillingDAO) {
        var ctrl = this;

        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        ctrl.isList = false;
        ctrl.credit = {};
        ctrl.availableCredit = 0;
        ctrl.creditUsages = angular.copy(creditUsages);
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
                    _.each(claim.creditUsages, function (credit) {
                        ctrl.availableCredit = ctrl.availableCredit - credit.usedAmount;
                    });
                    var appliedCredit = _.find(ctrl.creditUsages, {claimId: claim.id});
                    if(appliedCredit)
                        ctrl.credit.usedAmount = appliedCredit.usedAmount;
                }).catch(function (err) {
                    console.log("No claim found", err);
                    toastr.error("Error retrieveing claim.");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                toastr.error("Claim number is required.");
            }
        };

        ctrl.save = function () {
            if (ctrl.credit.claimId && ctrl.credit.usedAmount && (parseFloat(ctrl.credit.usedAmount) <= ctrl.availableCredit)) {
                ctrl.credit.usedAmount = parseFloat(ctrl.credit.usedAmount);
                if (_.find(ctrl.creditUsages, {claimId: ctrl.credit.claimId})) {
                    ctrl.creditUsages[_.findIndex(ctrl.creditUsages, {claimId: ctrl.credit.claimId})] = ctrl.credit;
                } else {
                    ctrl.creditUsages.push(ctrl.credit);
                }
                $modalInstance.close(ctrl.creditUsages);
            } else {
                toastr.error("Used Amount is required.");
            }
        };

        ctrl.openDeleteModal = function (credit)
        {
            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('common', 'confirmation_modal'),
                controller: 'ConfirmModalController as confirmModal',
                size: 'md',
                resolve: {
                    message: function () {
                        return "Are you sure you want to delete this Credit?";
                    },
                    title: function () {
                        return 'Credit';
                    },
                    subtitle: function () {
                        return;
                    }
                }
            });

            modalInstance.result.then(function () {
                if (_.find(ctrl.creditUsages, {claimId: credit.claimId})) {
                    _.remove(ctrl.creditUsages, {claimId: credit.claimId});
                    console.log("ctrl.creditUsages",ctrl.creditUsages);
                }
            });

        };

        ctrl.close = function () {
            $modalInstance.dismiss();
        };
    }
    ;
    angular.module('xenon.controllers').controller('ClaimCreditCtrl', ["creditUsages", "$modal", "$modalInstance", "$rootScope", "BillingDAO", ClaimCreditCtrl]);
})();