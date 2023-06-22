/* global ontime_data, _, appHelper, parseFloat */

(function () {
    function ManageBillingReconciliationCtrl($state, $timeout, $modal, $rootScope, InsurerDAO, PatientDAO, BillingDAO) {
        console.log("$state", $state);
        var ctrl = this;
        ctrl.title = $state.current.data.title;
        ctrl.isViewOnly = $state.current.data.title === 'View' ? true : false;
        ctrl.show = 'filtered';
        ctrl.selectedClaims = {};
        ctrl.currentDate = new Date();
        ctrl.viewRecords = 5;
        ctrl.filteredDatatableObj = {};
        ctrl.bill = {};
        var form_data;
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go(ctrl.type);
        }
        ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
        ctrl.searchParams = {limit: 5, pageNo: 1, sortBy: 'id', order: 'desc'};
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
        
        ctrl.resetDataAndFilters = function () {
            ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
            ctrl.searchParams = {limit: 5, pageNo: 1, sortBy: 'id', order: 'desc'};
            ctrl.selectedClaimsShow = [];
            ctrl.claims = [];
            ctrl.selectedClaims = [];
            ctrl.bill.reconciliationDetails = [];
        };

        ctrl.resetFilters = function () {
            delete ctrl.searchParams;
            ctrl.searchParams = {limit: 5, pageNo: 1, sortBy: 'id', order: 'desc'};
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

        if (ctrl.isViewOnly) {
            BillingDAO.getReconciliation({id: $state.params.id}).then(function (bill) {
                ctrl.reconciliationDetails = [];
                if (bill.reconciliationDetails) {
                    _.each(bill.reconciliationDetails, function (reconciliation) {
                        var claim = angular.copy(reconciliation.claim);
                        claim.paidAmount = reconciliation.paidAmount;
                        ctrl.reconciliationDetails.push(claim);
                    });
                }
                ctrl.creditUsages = angular.copy(bill.creditUsages);
                ctrl.bill = angular.copy(bill);
                ctrl.bill.receivedBy = bill.receivedFrom;
            });
        }

        ctrl.changeViewRecords = function () {
            ctrl.filteredDatatableObj.page.len(ctrl.viewRecords).draw();
        };

        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            if(ctrl.claims && ctrl.claims.length > 0)
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
        
        ctrl.updateAmountPaid = function (claimId, AmountPaid) {
            var selectedClaim = _.find(ctrl.selectedClaimsShow, {id: claimId});
            if (selectedClaim) {
                selectedClaim.AmountPaid = AmountPaid;
            }
            ctrl.getTotals()
        };
        
        ctrl.updateAllClaims = function(){
            if (ctrl.claims && ctrl.claims.length > 0) {
                ctrl.claims.forEach(function (claim) {
                    var selectedClaim = _.find(ctrl.selectedClaimsShow, {id: claim.id});
                    if (selectedClaim) {
                        claim.AmountPaid = selectedClaim.AmountPaid;
                    }
                });
            }
        }
        
        ctrl.filterClaims = function () {
            ctrl.updateSelection();
            if (ctrl.bill.receivedBy) {
                $rootScope.maskLoading();
                var searchParams = angular.copy(ctrl.searchParams);
                searchParams.insuranceProviderId = ctrl.bill.receivedBy;
                BillingDAO.searchClaims(searchParams).then(function (claims) {
                    ctrl.claims = angular.copy(claims);
                    ctrl.updateAllClaims();
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
            if ($('#billing_reconciliation_form')[0].checkValidity()) {
                 ctrl.getTotals();
                if (!(ctrl.totals['Applied'] && (parseFloat(ctrl.totals['Applied']).toFixed(2)
                        === (parseFloat((ctrl.bill.paymentAmount ? parseFloat(ctrl.bill.paymentAmount) : 0) + (ctrl.totals['Credits'] ? ctrl.totals['Credits'] : 0)).toFixed(2))))) {
                    toastr.error("Applied amount does not match available amount(credits + payment amount).");
                    return;
                }
                var billToSave = angular.copy(ctrl.bill);
                billToSave.orgCode = ontime_data.company_code;
                
                billToSave.reconciliationDetails = [];

                if (ctrl.selectedClaimsShow && ctrl.selectedClaimsShow.length > 0) {
                    _.each(ctrl.selectedClaimsShow, function (claim) {
                        if(claim.AmountPaid)
                            billToSave.reconciliationDetails.push({claimId: claim.id, paidAmount: claim.AmountPaid});
                    });
                }
                if (billToSave.reconciliationDetails.length === 0 && (!billToSave.creditUsages || billToSave.creditUsages.length === 0)) {
                    toastr.warning("Please add valid claims to save.");
                    return;
            }
                console.log("billToSave", billToSave);
                $rootScope.maskLoading();
                BillingDAO.saveReconciliations(billToSave).then(function () {
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
    angular.module('xenon.controllers').controller('ManageBillingReconciliationCtrl', ["$state", "$timeout", "$modal", "$rootScope", "InsurerDAO", "PatientDAO", "BillingDAO", ManageBillingReconciliationCtrl]);
})();
