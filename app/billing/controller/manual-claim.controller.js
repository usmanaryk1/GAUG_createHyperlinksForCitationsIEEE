(function () {
    function ManualClaimCtrl($rootScope, $http, $state, $timeout, $filter, InsurerDAO, BillingDAO, PatientDAO, Page) {
        var ctrl = this;
        Page.setTitle("Manual Claim");
        //Constants i.e. we need to fill the form
        ctrl.manualClaimObj = {};
        ctrl.reviewMode = false;
        ctrl.showPatientError = false;
        ctrl.claimId = undefined;
        ctrl.parseModifiers = function (serviceLineObj) {
            if (serviceLineObj.seviceProcedureModifiers != null) {
                serviceLineObj.seviceProcedureModifiers = JSON.parse(serviceLineObj.seviceProcedureModifiers);
            }
        }
        ctrl.stringifyModifiers = function (serviceLineObj) {
            if (serviceLineObj.seviceProcedureModifiers != null) {
                serviceLineObj.seviceProcedureModifiers = JSON.stringify(serviceLineObj.seviceProcedureModifiers);
            }
        }
        
        
        ctrl.unbindPatientCondition = function () {
            if (ctrl.manualClaimObj.patientConditionRelated) {
                if (ctrl.manualClaimObj.patientConditionRelated === 'EM') {
                    ctrl.manualClaimObj.patientConditionRelatedEM = 'true';
                    ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                } else if (ctrl.manualClaimObj.patientConditionRelated === 'OA') {
                    ctrl.manualClaimObj.patientConditionRelatedOA = 'true';
                    ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                } else if (ctrl.manualClaimObj.patientConditionRelated.indexOf('AA:') > -1) {
                    ctrl.manualClaimObj.patientConditionRelatedAA = 'true';
                    ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedAAState = ctrl.manualClaimObj.patientConditionRelated.split(':')[1];
                }
            } else {
                ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
            }
        };

        ctrl.bindPatientCondition = function (type) {
            switch (type) {
                case 'EM':
                    if (ctrl.manualClaimObj.patientConditionRelatedEM === 'true') {
                        if (ctrl.manualClaimObj.patientConditionRelatedAA === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                        if (ctrl.manualClaimObj.patientConditionRelatedOA === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                        ctrl.manualClaimObj.patientConditionRelated = 'EM';
                    } else {
                        ctrl.manualClaimObj.patientConditionRelated = null;
                    }
                    break;
                case 'AA':
                    if (ctrl.manualClaimObj.patientConditionRelatedAA === 'true') {
                        if (ctrl.manualClaimObj.patientConditionRelatedEM === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                        if (ctrl.manualClaimObj.patientConditionRelatedOA === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                        ctrl.manualClaimObj.patientConditionRelated = 'AA' + ctrl.manualClaimObj.patientConditionRelatedAAState ? ':' + ctrl.manualClaimObj.patientConditionRelatedAAState : '';
                    } else {
                        ctrl.manualClaimObj.patientConditionRelated = null;
                    }
                    break;
                case 'OA':
                    if (ctrl.manualClaimObj.patientConditionRelatedOA === 'true') {
                        if (ctrl.manualClaimObj.patientConditionRelatedEM === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                        if (ctrl.manualClaimObj.patientConditionRelatedAA === 'true')
                            ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                        ctrl.manualClaimObj.patientConditionRelated = 'OA';
                    } else {
                        ctrl.manualClaimObj.patientConditionRelated = null;
                    }
                    break;
                case 'STATE':
                    ctrl.manualClaimObj.patientConditionRelated = 'AA:' + ctrl.manualClaimObj.patientConditionRelatedAAState;
            }
        };
        
        ctrl.calculateTotalCharges = function () {
            if (ctrl.manualClaimObj && ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                var totalCharges = 0;
                angular.forEach(ctrl.manualClaimObj.serviceLines, function (item) {
                    if (!isNaN(item.serviceTotalBill)) {
                        totalCharges += parseFloat(item.serviceTotalBill);
                    }
                    ctrl.parseModifiers(item);
                });
                ctrl.manualClaimObj.totalCharges = totalCharges;
            } else {
                if (!ctrl.manualClaimObj)
                    ctrl.manualClaimObj = {};
                ctrl.manualClaimObj.totalCharges = totalCharges;
            }
        };
        if ($state.params.id && $state.params.id !== '') {
            ctrl.reviewMode = true;
            Page.setTitle("Claim 1500");
            $rootScope.layoutOptions.sidebar.hideMenu = true;
            var claim1500 = JSON.parse(localStorage.getItem('claim1500'));
            if (claim1500 && claim1500[$state.params.id]) {
                ctrl.manualClaimObj = claim1500[$state.params.id];
                ctrl.calculateTotalCharges();
                ctrl.unbindPatientCondition();
                if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                    angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                        if (serviceLine.serviceFromDate)
                            serviceLine.serviceFromDate = $filter('date')(Date.parse(serviceLine.serviceFromDate), $rootScope.dateFormat);
                        if (serviceLine.serviceToDate)
                            serviceLine.serviceToDate = $filter('date')(Date.parse(serviceLine.serviceToDate), $rootScope.dateFormat);
                    });
                }
            } else {
                $rootScope.maskLoading();
                BillingDAO.getClaimById({paramId: $state.params.id}).then(function (res) {
                    $rootScope.unmaskLoading();
                    ctrl.claimId = res.id;
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
                    ctrl.calculateTotalCharges();
                    ctrl.unbindPatientCondition();
                    if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                        angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                            if (serviceLine.serviceFromDate)
                                serviceLine.serviceFromDate = $filter('date')(Date.parse(serviceLine.serviceFromDate), $rootScope.dateFormat);
                            if (serviceLine.serviceToDate)
                                serviceLine.serviceToDate = $filter('date')(Date.parse(serviceLine.serviceToDate), $rootScope.dateFormat);
                        });
                    }
                }).catch(function (err) {
                    $rootScope.unmaskLoading();
                    toastr.error("Unable to retrieve claim details");
                    $state.go('app.manual_claim');
                });
            }
        } else {
            $rootScope.maskLoading();
            PatientDAO.retrieveForSelect({}).then(function (res) {
                ctrl.patientList = res;
            }).catch(function (data, status) {
                ctrl.patientList = ontimetest.patients;
            }).then(function () {
                $rootScope.unmaskLoading();
            });
            ctrl.manualClaimObj.serviceLines = [{}];
        }

        ctrl.checkReviewMode = function () {
            if (ctrl.reviewMode)
                $("#manual_claim_form :input").prop("disabled", true);
            $("#manual_claim_form :input").css('background-color', '#fff');
        };

        ctrl.getPatientDetail = function (patientId) {
            $rootScope.paginationLoading = true;
            BillingDAO.getPatientDetails({patientId: patientId}).then(function (res) {
                if (res && res.claim1500Data) {
                    ctrl.billingClaimObj = res;
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
                    ctrl.calculateTotalCharges();
//                    console.log(JSON.stringify(ctrl.billingClaimObj));
                    ctrl.unbindPatientCondition();
                    if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                        angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                            if (serviceLine.serviceFromDate)
                                serviceLine.serviceFromDate = $filter('date')(Date.parse(serviceLine.serviceFromDate), $rootScope.dateFormat);
                            if (serviceLine.serviceToDate)
                                serviceLine.serviceToDate = $filter('date')(Date.parse(serviceLine.serviceToDate), $rootScope.dateFormat);
                        });
                    }
                }
            }).catch(function () {
                toastr.error("Failed to retrieve patients.");
            }).then(function () {
                $rootScope.paginationLoading = false;
            });
        };

        ctrl.addServiceLine = function () {
            if (!ctrl.manualClaimObj.serviceLines) {
                ctrl.manualClaimObj.serviceLines = [];
            }
            ctrl.manualClaimObj.serviceLines.push({'serviceNPI':ctrl.manualClaimObj.companyNPI});
        };
        ctrl.removeServiceLine = function (index) {
            ctrl.manualClaimObj.serviceLines.splice(index, 1);
        };

        ctrl.processManualClaim = function () {
            if (!ctrl.patientId || ctrl.patientId === '') {
                ctrl.showPatientError = true;
                return;
            }
            if ($('#manual_claim_form')[0].checkValidity()) {
//                console.log('valid');
                if (!ctrl.manualClaimObj.serviceLines || ctrl.manualClaimObj.serviceLines.length === 0) {
                    toastr.error("Please add atleast one service line.");
                    return;
                }
                if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                    ctrl.billingClaimObj.totalServiceLines = ctrl.manualClaimObj.serviceLines.length;
                    ctrl.billingClaimObj.totalCosts = 0;
                    ctrl.billingClaimObj.authorizedCodes = [];
                    angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                        ctrl.billingClaimObj.totalCosts += serviceLine.serviceTotalBill ? serviceLine.serviceTotalBill : 0;
                        if (ctrl.billingClaimObj.authorizedCodes.indexOf(serviceLine.serviceProcedureCode) === -1) {
                            ctrl.billingClaimObj.authorizedCodes.push(serviceLine.serviceProcedureCode);
                        }
                        ctrl.stringifyModifiers(serviceLine);
                    });
                    ctrl.billingClaimObj.authorizedCodes = ctrl.billingClaimObj.authorizedCodes.join(',');
                }
                ctrl.billingClaimObj.claim1500Data = JSON.stringify(ctrl.manualClaimObj);
                BillingDAO.processManualClaim({patientId: ctrl.patientId, processedOn: $filter('date')(new Date(), $rootScope.dateFormat)}, ctrl.billingClaimObj)
                        .then(function (res) {
                            $state.go('app.billing_batch', {id: res.id});
                        }).catch(function () {
                    toastr.error("Can not process manual claim.");
                });
            } else {
//                console.log('invalid');
                $('input,textarea,select').filter('[required]:visible').addClass('danger-input');
                $('input,textarea,select').filter('.ng-invalid:first').focus();
            }
        };

        ctrl.openLookup = function (type, elemId) {
            var url, title;
            if (type === 'location') {
                localStorage.setItem('locationLookup', elemId);
                url = $state.href('app.location_lookup');
                title = "LocationLookup";
            }
            if (type === 'resubmission') {
                url = $state.href('app.resubmission_lookup');
                title = "ResubmissionLookup";
            }
            var params = [
                'height=' + screen.height / 1.5,
                'width=' + screen.width / 1.5,
                'location=0'
            ].join(',');
            var newwindow = window.open(url, title, params);
            if (window.focus) {
                newwindow.moveTo(50, 50);
                newwindow.focus();
            }
        };

        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.payorList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });

    }
    ;
    angular.module('xenon.controllers').controller('ManualClaimCtrl', ["$rootScope", "$http", "$state", "$timeout", "$filter", "InsurerDAO", "BillingDAO", "PatientDAO", "Page", ManualClaimCtrl]);
})();
