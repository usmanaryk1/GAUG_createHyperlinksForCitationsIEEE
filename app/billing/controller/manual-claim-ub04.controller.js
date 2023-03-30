(function () {
    function ManualClaimUB04Ctrl($rootScope, $http, $state, $timeout, $filter, InsurerDAO, BillingDAO, PatientDAO, Page) {
        var ctrl = this;
        Page.setTitle("Manual Claim UB04");
        //Constants i.e. we need to fill the form
        ctrl.manualClaimObj = {serviceLines: [{}]};
        ctrl.reviewMode = false;
        ctrl.showPatientError = false;
        ctrl.claimId = undefined;

        if ($state.params.id && $state.params.id !== '') {
            ctrl.reviewMode = true;
            Page.setTitle("Claim UB04");
            $rootScope.layoutOptions.sidebar.hideMenu = true;
            var claimUB04 = JSON.parse(localStorage.getItem('claimUB04'));
            if (claimUB04 && claimUB04[$state.params.id]) {
                ctrl.manualClaimObj = claimUB04[$state.params.id];
                if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                    angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                        ctrl.parseModifiers(serviceLine);
                        if (serviceLine.serviceDate)
                            serviceLine.serviceDate = $filter('date')(Date.parse(serviceLine.serviceDate), $rootScope.dateFormat);
                    });
                    ctrl.manualClaimObj.serviceLines.sort(function (a, b) {
                        return Date.parse(a.serviceDate) - Date.parse(b.serviceDate);
                    });
                }
            } else {
                $rootScope.maskLoading();
                BillingDAO.getClaimById({paramId: $state.params.id}).then(function (res) {
                    $rootScope.unmaskLoading();
                    ctrl.claimId = res.id;
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
                    if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                        angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                            ctrl.parseModifiers(serviceLine);
                            if (serviceLine.serviceDate)
                                serviceLine.serviceDate = $filter('date')(Date.parse(serviceLine.serviceDate), $rootScope.dateFormat);
                        });
                        ctrl.manualClaimObj.serviceLines.sort(function (a, b) {
                            return Date.parse(a.serviceDate) - Date.parse(b.serviceDate);
                        });
                    }
                }).catch(function (err) {
                    $rootScope.unmaskLoading();
                    toastr.error("Unable to retrieve claim details");
                    $state.go('app.manual_claim_ub04');
                });
            }
        } else {
            $rootScope.maskLoading();
            PatientDAO.retrieveForSelect({}).then(function (res) {
                ctrl.patientList = res;
            }).catch(function (data, status) {
//                ctrl.patientList = ontime_data.patients;
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
            $rootScope.paginationLoading = true;
            BillingDAO.getPatientDetails({patientId: patientId}).then(function (res) {
                if (res && res.claim1500Data) {
                    ctrl.billingClaimObj = res;
                    ctrl.manualClaimObj = JSON.parse(res.claim1500Data);
                    if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
                        angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
                            if (serviceLine.serviceDate)
                                serviceLine.serviceDate = $filter('date')(Date.parse(serviceLine.serviceDate), $rootScope.dateFormat);
                        });
                    }
                }
            }).catch(function () {
                toastr.error("Failed to retrieve patient details.");
            }).then(function () {
                $rootScope.paginationLoading = false;
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

//        ctrl.processManualClaim = function () {
//            var fromDate, toDate;
//            if (!ctrl.patientId || ctrl.patientId === '') {
//                ctrl.showPatientError = true;
//                return;
//            }
//            if ($('#manual_claim_form')[0].checkValidity()) {
////                console.log('valid');
//                if (!ctrl.manualClaimObj.serviceLines || ctrl.manualClaimObj.serviceLines.length === 0) {
//                    toastr.error("Please add atleast one service line.");
//                    return;
//                }
//                if (ctrl.manualClaimObj.serviceLines && ctrl.manualClaimObj.serviceLines.length > 0) {
//                    ctrl.billingClaimObj.totalServiceLines = ctrl.manualClaimObj.serviceLines.length;
//                    ctrl.billingClaimObj.totalCosts = ctrl.manualClaimObj.totalCharges;
//                    ctrl.billingClaimObj.authorizedCodes = [];
//                    angular.forEach(ctrl.manualClaimObj.serviceLines, function (serviceLine) {
//                        if (fromDate == null || new Date(serviceLine.serviceFromDate).getTime() <= new Date(fromDate).getTime()) {
//                            fromDate = serviceLine.serviceFromDate;
//                        }
//                        if (toDate == null || new Date(serviceLine.serviceToDate).getTime() >= new Date(toDate).getTime()) {
//                            toDate = serviceLine.serviceToDate;
//                        }
//                        if (ctrl.billingClaimObj.authorizedCodes.indexOf(serviceLine.serviceProcedureCode) === -1) {
//                            ctrl.billingClaimObj.authorizedCodes.push(serviceLine.serviceProcedureCode);
//                        }
//                        ctrl.stringifyModifiers(serviceLine);
//                    });
//                    ctrl.billingClaimObj.authorizedCodes = ctrl.billingClaimObj.authorizedCodes.join(',');
//                }
//                ctrl.billingClaimObj.claim1500Data = JSON.stringify(ctrl.manualClaimObj);
//                BillingDAO.processManualClaim({patientId: ctrl.patientId, processedOn: $filter('date')(new Date(), $rootScope.dateFormat), fromDate: fromDate, toDate: toDate}, ctrl.billingClaimObj)
//                        .then(function (res) {
//                            toastr.success("Manual claim processed.");
//                            window.location.href = $rootScope.serverPath + 'billing/session/' + res.id + '/edi/download';
//                            ctrl.manualClaimObj = {};
//                            ctrl.manualClaimObj.serviceLines = [{}];
//                            $("#sboxit-1").select2("val", null);
//                        }).catch(function () {
//                    toastr.error("Can not process manual claim.");
//                });
//            } else {
////                console.log('invalid');
//                $('input,textarea,select').filter('[required]:visible').addClass('danger-input');
//                $('input,textarea,select').filter('.ng-invalid:first').focus();
//            }
//        };

//        ctrl.openLookup = function (type, elemId) {
//            var url, title;
//            if (type === 'location') {
//                localStorage.setItem('locationLookup', elemId);
//                url = $state.href('app.location_lookup');
//                title = "LocationLookup";
//            }
//            if (type === 'resubmission') {
//                url = $state.href('app.resubmission_lookup');
//                title = "ResubmissionLookup";
//            }
//            var params = [
//                'height=' + screen.height / 1.5,
//                'width=' + screen.width / 1.5,
//                'location=0'
//            ].join(',');
//            var newwindow = window.open(url, title, params);
//            if (window.focus) {
//                newwindow.moveTo(50, 50);
//                newwindow.focus();
//            }
//        };

        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.payorList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });

    }
    angular.module('xenon.controllers').controller('ManualClaimUB04Ctrl', ["$rootScope", "$http", "$state", "$timeout", "$filter", "InsurerDAO", "BillingDAO", "PatientDAO", "Page", ManualClaimUB04Ctrl]);
})();
