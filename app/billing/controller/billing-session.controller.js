(function () {
    function BillingSessionCtrl($rootScope, $filter, $modal, $timeout, PayrollDAO, BillingDAO, InsurerDAO, $state, Page) {
        var ctrl = this;
        Page.setTitle("Billing Session");
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.searchParams.processedOn = $filter('date')(new Date(), $rootScope.dateFormat)
        ctrl.criteriaSelected = false;
        ctrl.errorMsg = {};
        ctrl.insuranceProviderList = [];
        ctrl.baseUrl = ontimetest.weburl;
        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.insuranceProviderList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        if ($state.params.id && $state.params.id !== '') {
            ctrl.processdMode = true;
            $rootScope.maskLoading();
            BillingDAO.getSessionById({paramId: $state.params.id}).then(function (res) {
                $rootScope.unmaskLoading();
                if (res && res.billingClaims) {
                    ctrl.billingSessions = res.billingClaims;
                    ctrl.sessionId = res.id;
                    ctrl.insuranceProvider = res.insuranceProvider;
                    ctrl.totalCharges = res.totalCharges;
                    ctrl.totalClaims = res.totalClaims;
                    if (res.sessionStartDate)
                        ctrl.sessionStartDate = Date.parse(res.sessionStartDate);
                    if (res.sessionEndDate)
                        ctrl.sessionEndDate = Date.parse(res.sessionEndDate);
                    ctrl.rerenderDataTable();
                }
            }).catch(function (err) {
                $rootScope.unmaskLoading();
                toastr.error("Some arror occurred while retrieving existing session.");
            });
        } else {
            ctrl.processdMode = false;
        }
        var otHdConstant = 1;
        ctrl.resetFilters = function () {
            ctrl.searchParams.fromDate = null;
            ctrl.searchParams.toDate = null;
            ctrl.searchParams.insuranceProviderId = undefined;
            ctrl.billingSessions = [];
            ctrl.billingSessionToProcess = [];
            ctrl.criteriaSelected = false;
            ctrl.rerenderDataTable();
            ctrl.processClicked = false;
        };

        ctrl.filterSessions = function () {
            ctrl.errorMsg = {};
            if (!ctrl.searchParams.insuranceProviderId || ctrl.searchParams.insuranceProviderId == "") {
                ctrl.searchParams.insuranceProviderId = null;
                ctrl.errorMsg.insuranceProvider = true;
            }
            if (!ctrl.searchParams.fromDate || ctrl.searchParams.fromDate == "") {
                ctrl.searchParams.fromDate = null;
                ctrl.errorMsg.fromDate = true;
            }
            if (!ctrl.searchParams.toDate || ctrl.searchParams.toDate == "") {
                ctrl.searchParams.toDate = null;
                ctrl.errorMsg.toDate = true;
            }
            if (ctrl.searchParams.fromDate != null && ctrl.searchParams.toDate != null && ctrl.searchParams.insuranceProviderId != null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSessions();
            } else {
                ctrl.criteriaSelected = false;
                ctrl.billingSessions = [];
                ctrl.billingSessionToProcess = [];
                ctrl.rerenderDataTable();
            }
        };
        var getDateDiff = function (firstDate, secondDate) {
            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
        }
        ctrl.retrieveSessions = function () {
            if (ctrl.criteriaSelected) {
                $rootScope.maskLoading();
                ctrl.dataRetrieved = false;
                ctrl.reviewedFilters = angular.copy(ctrl.searchParams);
                BillingDAO.reviewSessions(ctrl.searchParams).then(function (res) {
                    ctrl.dataRetrieved = true;
                    ctrl.billingSessions = res;
                    ctrl.billingSessionToProcess = angular.copy(res);
                    angular.forEach(ctrl.billingSessions, function (billingObj) {
                        billingObj.patientBirthDate = Date.parse(billingObj.patientBirthDate);
//                        billingObj.claim1500Data = JSON.parse(billingObj.claim1500Data);
                        billingObj.uniqueId = randomString();
                    });
                    ctrl.rerenderDataTable();
                }, function (e) {
                    if (e.data != null) {
                        toastr.error(e.data);
                    } else {
                        toastr.error("Payroll sessions cannot be retrieved.");
                    }

                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.processSession = function () {
            ctrl.processClicked = true;
            var payload = angular.copy(ctrl.billingSessions);
            angular.forEach(payload, function (billingObj) {
                billingObj.patientBirthDate = $filter('date')(billingObj.patientBirthDate, $rootScope.dateFormat);
                delete billingObj.uniqueId;
            });
            ctrl.reviewedFilters.processedOn = $filter('date')(new Date(), $rootScope.dateFormat);
            $rootScope.maskLoading();
            BillingDAO.processSessions(ctrl.reviewedFilters, payload).then(function (res) {
//                console.log(res);
                ctrl.resetFilters();
                toastr.success("Billing sessions are processed.");
//                $state.go('app.batch_session', {id: res.id});
            }).catch(function (e) {
                toastr.error("Billing sessions cannot be processed.");
            }).then(function () {
                ctrl.processClicked = false;
                $rootScope.unmaskLoading();
            });
        };
        ctrl.changeViewRecords = function () {
            ctrl.datatableObj.page.len(ctrl.viewRecords).draw();
        };
        _setClaim1500InLocalStorage = function (claim) {
            if (!claim || !claim.claim1500Data)
                return;
            var claim1500 = {};
            claim1500[claim.uniqueId] = JSON.parse(claim.claim1500Data);
            localStorage.setItem('claim1500', JSON.stringify(claim1500));
        };
        ctrl.openClaim1500 = function (claim) {
            _setClaim1500InLocalStorage(claim);
            var url = $state.href('app.manual_claim_review', {id: claim.uniqueId ? claim.uniqueId : claim.id});
            var params = [
                'height=' + screen.height,
                'width=' + screen.width,
                'location=0',
                'fullscreen=yes' // only works in IE, but here for completeness
            ].join(',');
            var newwindow = window.open(url, claim.uniqueId, params);
            if (window.focus) {
                newwindow.moveTo(0, 0);
                newwindow.focus();
            }
        };
        ctrl.rerenderDataTable = function () {
            var pageInfo;
            if (ctrl.datatableObj.page != null) {
                pageInfo = ctrl.datatableObj.page.info();
            }
            var billingSessions = angular.copy(ctrl.billingSessions);
            ctrl.billingSessions = [];
            $("#example-1_wrapper").remove();

            $timeout(function () {
                ctrl.billingSessions = billingSessions;
                $timeout(function () {
                    $("#example-1").wrap("<div class='table-responsive'></div>");
                    if (ctrl.processdMode) {
                        $(".dt-button").attr("class", "btn btn-info green_bt pull-right print-btn");
                    }
                }, 50);
                if (pageInfo != null) {
                    $timeout(function () {
                        var pageNo = Number(pageInfo.page);
                        if (ctrl.datatableObj.page.info().pages <= pageInfo.page) {
                            pageNo--;
                        }
                        ctrl.datatableObj.page(pageNo).draw(false);
                    }, 20);
                }
            });
        };
        function randomString() {
            var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length = 32;
            var result = '';
            for (var i = length; i > 0; --i)
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        }
    }
    angular.module('xenon.controllers').controller('BillingSessionCtrl', ["$rootScope", "$filter", "$modal", "$timeout", "PayrollDAO", "BillingDAO", "InsurerDAO", "$state", "Page", BillingSessionCtrl]);
})();
