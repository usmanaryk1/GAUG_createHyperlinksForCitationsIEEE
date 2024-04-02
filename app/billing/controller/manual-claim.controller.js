(function () {
    function ManualClaimCtrl($rootScope, $http, $state, $timeout, $filter, InsurerDAO, BillingDAO, PatientDAO) {
        var ctrl = this;
        //Constants i.e. we need to fill the form
        ctrl.manualClaimObj = {};
        ctrl.reviewMode = false;
        if ($state.params.id && $state.params.id !== '') {
            ctrl.reviewMode = true;
            $rootScope.layoutOptions.sidebar.hideMenu = true;
            var claim1500 = JSON.parse(localStorage.getItem('claim1500'));
            if (claim1500 && claim1500[$state.params.id]) {
                ctrl.manualClaimObj = claim1500[$state.params.id];
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
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
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
        };

        ctrl.getPatientDetail = function (patientId) {
            BillingDAO.getPatientDetails({patientId: patientId}).then(function (res) {
                if (res && res.claim1500Data) {
                    ctrl.bilingClaimObj = res;
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
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
            });
        };

        ctrl.addServiceLine = function () {
            if (!ctrl.manualClaimObj.serviceLines) {
                ctrl.manualClaimObj.serviceLines = [];
            }
            ctrl.manualClaimObj.serviceLines.push({});
        };
        ctrl.removeServiceLine = function (index) {
            ctrl.manualClaimObj.serviceLines.splice(index, 1);
        };

        ctrl.unbindPatientCondition = function () {
            if (ctrl.manualClaimObj.patientConditionRelated) {
                if (ctrl.manualClaimObj.patientConditionRelated === 'EM') {
                    ctrl.manualClaimObj.patientConditionRelatedEM === 'true';
                    ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                } else if (ctrl.manualClaimObj.patientConditionRelated === 'OA') {
                    ctrl.manualClaimObj.patientConditionRelatedOA === 'true';
                    ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedAA = 'false';
                } else if (ctrl.manualClaimObj.patientConditionRelated.indexOf('AA:') > -1) {
                    ctrl.manualClaimObj.patientConditionRelatedAA === 'true';
                    ctrl.manualClaimObj.patientConditionRelatedEM = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedOA = 'false';
                    ctrl.manualClaimObj.patientConditionRelatedAAState = ctrl.manualClaimObj.patientConditionRelated.split(':')[1];
                }
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


        ctrl.processManualClaim = function () {
            if ($('#manual_claim_form')[0].checkValidity()) {
//                console.log('valid');
                if (!ctrl.manualClaimObj.serviceLines || ctrl.manualClaimObj.serviceLines.length === 0) {
                    toastr.error("Please add atleast one service line.");
                    return;
                }
                ctrl.bilingClaimObj.claim1500Data = JSON.stringify(ctrl.manualClaimObj);
                if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                    ctrl.bilingClaimObj.totalServiceLines = ctrl.manualClaimObj.serviceLines.length;
                    ctrl.bilingClaimObj.totalCosts = 0;
                    angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                        ctrl.bilingClaimObj.totalCosts += serviceLine.serviceTotalBill ? serviceLine.serviceTotalBill : 0;
                    });
                }
                BillingDAO.processManualClaim({patientId: ctrl.patientId, processedOn: $filter('date')(new Date(), $rootScope.dateFormat)}, ctrl.bilingClaimObj)
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

//        InsurerDAO.retrieveAll().then(function (res) {
//            ctrl.payorList = res;
//        }).catch(function () {
//            toastr.error("Failed to retrieve insurance provider list.");
//        });

    }
    ;
    angular.module('xenon.controllers').controller('ManualClaimCtrl', ["$rootScope", "$http", "$state", "$timeout", "$filter", "InsurerDAO", "BillingDAO", "PatientDAO", ManualClaimCtrl]);
})();