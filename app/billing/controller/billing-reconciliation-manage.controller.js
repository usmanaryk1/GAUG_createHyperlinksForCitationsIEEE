/* global ontime_data, _, appHelper, parseFloat */

(function () {
    function ManageBillingReconciliationCtrl($state, $timeout, $modal, $rootScope, InsurerDAO, PatientDAO, BillingDAO) {
        var ctrl = this;
        ctrl.title = $state.current.data.title;
        ctrl.isViewOnly = $state.current.data.title === 'View' ? true : false;
        ctrl.show = 'filtered';
        ctrl.selectedClaims = {};
        ctrl.currentDate = new Date();
        ctrl.viewRecords = 10;
        ctrl.filteredDatatableObj = {};
        ctrl.bill = {};
        ctrl.claimList = {allSelected: false, setAmountDue: false};
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go(ctrl.type);
        }
        ctrl.totals = {AmountDue: 0, Applied: 0, Credits: 0};
        ctrl.searchParams = {limit: 10, pageNo: 1, sortBy: 'id', order: 'desc', 'billingReconciliation': true};
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
            ctrl.searchParams = {limit: 10, pageNo: 1, sortBy: 'id', order: 'desc', 'billingReconciliation': true};
            ctrl.selectedClaimsShow = [];
            ctrl.claims = [];
            ctrl.selectedClaims = [];
            ctrl.bill.reconciliationDetails = [];
        };

        ctrl.resetFilters = function () {
            delete ctrl.searchParams;
            ctrl.searchParams = {limit: 10, pageNo: 1, sortBy: 'id', order: 'desc', 'billingReconciliation': true};
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
            ctrl.claimList = {allSelected: false, setAmountDue: false};
            ctrl.searchParams.pageNo = pagenumber;
            if (ctrl.claims && ctrl.claims.length > 0)
                ctrl.filterClaims();
        };

        ctrl.updateSelection = function () {
            _.each(ctrl.selectedClaims, function (selected, selectedClaimId) {
                var claim = _.find(ctrl.claims, {id: parseInt(selectedClaimId)});
                if (claim && !_.find(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)}) && (selected === true)) {
                    if (ctrl.claimList.setAmountDue)
                        claim.AmountPaid = (claim.totalCosts - claim.paidAmount) > 0 ? parseFloat(claim.totalCosts - claim.paidAmount).toFixed(2) : 0;
                    ctrl.selectedClaimsShow.push(claim);
                } else if (claim && _.find(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)}) && (selected === false)) {
                    delete claim.AmountPaid;
                    _.remove(ctrl.selectedClaimsShow, {id: parseInt(selectedClaimId)});
                }
            });
            ctrl.getTotals();
            _.reverse(ctrl.selectedClaimsShow);
        };

        ctrl.updateAllSelection = function () {
            ctrl.claims.forEach(function (claim) {
                ctrl.selectedClaims[claim.id] = ctrl.claimList.isSelected;
            });
            ctrl.updateSelection();
        };

        ctrl.updateAmountDue = function () {
            if (ctrl.claimList.setAmountDue) {
                ctrl.claims.forEach(function (claim) {
                    if (ctrl.selectedClaims[claim.id]) {
                        claim.AmountPaid = (claim.totalCosts - claim.paidAmount) > 0 ? parseFloat(claim.totalCosts - claim.paidAmount).toFixed(2) : 0;
                    }
                });
                ctrl.updateAllClaims();
            }
        };

        ctrl.updateAmountPaid = function (claimId, AmountPaid) {
            var selectedClaim = _.find(ctrl.selectedClaimsShow, {id: claimId});
            if (selectedClaim) {
                selectedClaim.AmountPaid = AmountPaid;
            }
            ctrl.getTotals();
        };
        
        ctrl.removeAmountPaid = function (claimId) {
            var selectedClaim = _.find(ctrl.selectedClaimsShow, {id: claimId});
            if (selectedClaim) {
                delete selectedClaim.AmountPaid;
            }
            ctrl.getTotals();
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
        };
        
        ctrl.updateSelectedClaimsShow = function () {
            if (ctrl.selectedClaimsShow && ctrl.selectedClaimsShow.length > 0) {
                ctrl.selectedClaimsShow.forEach(function (claim) {
                    if (claim) {
                        if (ctrl.claimList.setAmountDue === true) {
                            claim.AmountPaid = (claim.totalCosts - claim.paidAmount) > 0 ? parseFloat(claim.totalCosts - claim.paidAmount).toFixed(2) : 0;
                        } else {
                            delete claim.AmountPaid;
                        }
                    }
                });
                ctrl.getTotals();
            }
        };

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
                ctrl.bill.creditUsages = angular.copy(creditUsages);
                ctrl.getTotals();
                toastr.success("Credits updated successfully.");
            }, function () {
            });
        };

        ctrl.save = function () {
            ctrl.formSubmitted = true;
            var isValid = true;
            ctrl.selectedClaimsShow.forEach(function (claim) {
                if(ctrl.selectedClaims[claim.id] && _.isUndefined(claim.AmountPaid)){
                    isValid = false;
                }
            });
            if ($('#billing_reconciliation_form')[0].checkValidity() && isValid) {
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
                        if (claim.AmountPaid)
                            billToSave.reconciliationDetails.push({claimId: claim.id, paidAmount: claim.AmountPaid});
                    });
                }
                if (billToSave.reconciliationDetails.length === 0 && (!billToSave.creditUsages || billToSave.creditUsages.length === 0)) {
                    toastr.warning("Please add valid claims to save.");
                    return;
                }
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
                if(ctrl.selectedClaims[claim.id]){
                    ctrl.totals.AmountDue = ctrl.totals.AmountDue + ((claim.totalCosts ? parseFloat(claim.totalCosts) : 0) - (claim.paidAmount ? parseFloat(claim.paidAmount) : 0));
                    ctrl.totals.Applied = ctrl.totals.Applied + (claim.AmountPaid ? parseFloat(claim.AmountPaid) : 0);
                }                
            });
            _.each(ctrl.bill.creditUsages, function (credit) {
                ctrl.totals.Credits = ctrl.totals.Credits + (credit.usedAmount ? parseFloat(credit.usedAmount) : 0);
            });
        };

    }
    angular.module('xenon.controllers')
            .controller('ManageBillingReconciliationCtrl', ["$state", "$timeout", "$modal", "$rootScope", "InsurerDAO", "PatientDAO", "BillingDAO", ManageBillingReconciliationCtrl])
            .config(['$provide', function ($provide) {
                    $provide.decorator('$locale', ['$delegate', function ($delegate) {
                            if ($delegate.id == 'en-us') {
                                $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
                                $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
                            }
                            return $delegate;
                        }]);
                }])
})();