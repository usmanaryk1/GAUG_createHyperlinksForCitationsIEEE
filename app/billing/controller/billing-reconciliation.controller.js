/* global ontime_data, _, appHelper */

(function () {
    function BillingReconciliationCtrl($state, $timeout, $modal, $rootScope, InsurerDAO, PatientDAO, BillingDAO) {
        console.log("$state", $state);
        var ctrl = this;
        ctrl.title = $state.current.data && $state.current.data.title ? $state.current.data.title : null;
        ctrl.show = 'filtered';
        ctrl.selectedClaims = {};
        ctrl.currentDate = new Date();
        ctrl.viewRecords = 5;
        ctrl.filteredDatatableObj = {};
        ctrl.selectedDatatableObj = {};
        ctrl.bill = {};
        var form_data;
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go(ctrl.type);
        }
        ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
        ctrl.searchParams = {limit: 5, pageNo: 1, sortBy: 'id', order: 'desc', 'billingReconciliation': true};
        ctrl.selectedClaimsShow = [];
        ctrl.getlength = function (selectedClaims) {
            var totalSelected = 0;
            _.each(selectedClaims, function (selected) {
                if (selected === true) {
                    totalSelected++;
                }
            });
            return totalSelected;
        };


        ctrl.resetFilters = function () {
            delete ctrl.searchParams;
            ctrl.searchParams = {limit: 5, pageNo: 1, sortBy: 'id', order: 'desc', 'billingReconciliation': true};
        };
        
        ctrl.resetDataAndFilters = function () {
            ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
            ctrl.resetFilters();
            ctrl.selectedClaimsShow = [];
            ctrl.claims = [];
            ctrl.selectedClaims = [];
            ctrl.bill.reconciliationDetails = [];
        };

        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.insuranceProviderList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });


        ctrl.renderPatientList = function () {
            var search = {};
            if (ctrl.bill.receivedBy) {
                search['insuranceProviderId'] = ctrl.bill.receivedBy;
            }
            PatientDAO.retrieveForSelect(search).then(function (res) {
                ctrl.patientList = res;
            }).catch(function () {
                toastr.error("Failed to retrieve patient list.");
            });
        };

        ctrl.renderPatientList();

        ctrl.changeViewRecords = function () {
            ctrl.filteredDatatableObj.page.len(ctrl.viewRecords).draw();
        };

        ctrl.rerenderSelectedDataTable = function () {
            $("#selected-claims_wrapper").remove();
            $timeout(function () {
                $timeout(function () {
                    $("#selected-claims").wrap("<div class='table-responsive'></div>");
                    ctrl.selectedDatatableObj.page.len(ctrl.viewRecords).draw();
                }, 50);
            });
        };

        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.filterClaims();
        };

        ctrl.updateSelection = function () {
            _.each(ctrl.selectedClaims, function (selected, selectedClaimId) {
                if (_.find(ctrl.claims, {id: parseInt(selectedClaimId)}) && !_.find(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)}) && (selected === true)) {
                    ctrl.selectedClaimsShow.push(_.find(ctrl.claims, {id: parseInt(selectedClaimId)}));
                } else if (_.find(ctrl.claims, {id: parseInt(selectedClaimId)}) && _.find(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)}) && (selected === false)) {
                    _.remove(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)});
                }
            });
            ctrl.getTotals();
        };

        ctrl.filterClaims = function () {
            ctrl.updateSelection();
            if (ctrl.bill.receivedBy) {
                $rootScope.maskLoading();
                var searchParams = angular.copy(ctrl.searchParams);
                searchParams.insuranceProviderId = ctrl.bill.receivedBy;
                BillingDAO.searchClaims(searchParams).then(function (claims) {
                    ctrl.claims = angular.copy(claims);
                }).catch(function (err) {
                    console.log("No claim found", err);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                toastr.warning('Please select insurance provider');
            }
        };
        ctrl.openAdjustments = function () {
            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('billing', 'claim_adjustment_modal'),
                controller: 'ClaimAdjustmentCtrl as claimAdjustment',
                size: 'md'
            });
            modalInstance.result.then(function (claim) {
                if (_.findIndex(ctrl.claims, {id: claim.id}) > -1) {
                    ctrl.claims[_.findIndex(ctrl.claims, {id: claim.id})].totalCosts = claim.totalCosts;
                    ctrl.updateSelection();
                }
            }, function () {
                console.log("cancelled");
            });
        };

        ctrl.openCredits = function () {
            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('billing', 'claim_credit_modal'),
                controller: 'ClaimCreditCtrl as claimCredit',
                size: 'md',
                resolve: {
                    creditUsages: function () {
                        return ctrl.bill.creditUsages ? angular.copy(ctrl.bill.creditUsages) : [];
                    }
                }
            });
            modalInstance.result.then(function (creditUsages) {
                console.log("creditUsages", creditUsages);
                ctrl.bill.creditUsages = angular.copy(creditUsages);                    
                ctrl.getTotals();
                toastr.success("Credits updated successfully.");
            }, function () {
            });
        };

        ctrl.save = function () {
            if ($('#billing_reconciliation_form').serialize() !== form_data) {
                ctrl.formDirty = true;
            }
            if (($('#billing_reconciliation_form').valid()) || !ctrl.formDirty) {
                ctrl.bill.orgCode = ontime_data.company_code;
                ctrl.bill.reconciliationDetails = [];

                if (ctrl.selectedClaimsShow && ctrl.selectedClaimsShow.length > 0) {
                    _.each(ctrl.selectedClaimsShow, function (claim) {
                        ctrl.bill.reconciliationDetails.push({claimId: claim.id, paidAmount: claim.AmountPaid});
                    });
                }
                console.log("ctrl.bill", ctrl.bill);
                $rootScope.maskLoading();
                BillingDAO.saveReconciliations(ctrl.bill).then(function () {
                    toastr.success("Reconciliation saved successfully.");
                    $state.go('app.billing_reconciliation_list');
                }).catch(function (data, status) {
                    toastr.error("Reconciliation cannot be saved.");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.getTotals = function () {
            ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
            _.each(ctrl.selectedClaimsShow, function (claim) {
                ctrl.totals.AmountDue = ctrl.totals.AmountDue + ((claim.totalCosts ? parseFloat(claim.totalCosts) : 0) - (claim.paidAmount ? parseFloat(claim.paidAmount) : 0));
                ctrl.totals.Applied = ctrl.totals.Applied + (claim.AmountPaid ? parseFloat(claim.AmountPaid) : 0);
            });
            _.each(ctrl.bill.creditUsages, function (credit) {
                ctrl.totals.Credits = ctrl.totals.Credits + (credit.usedAmount ? parseFloat(credit.usedAmount) : 0);
            });
        };

    }
    angular.module('xenon.controllers').controller('BillingReconciliationCtrl', ["$state", "$timeout", "$modal", "$rootScope", "InsurerDAO", "PatientDAO", "BillingDAO", BillingReconciliationCtrl]);
})();
