(function() {
    function PayrollHistoryCtrl($rootScope, $scope, $http, PayrollDAO, $timeout, $state) {
        var ctrl = this;
//        ctrl.companyCode = ontimetest.company_code;
//        ctrl.baseUrl = ontimetest.weburl;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.criteriaSelected = false;
        ctrl.historyList = [];
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.navigateToProcessedPage = function(id) {
            $state.go('app.batch_session', {id: id});
        };

        ctrl.resetFilters = function() {
            ctrl.searchParams.fromDate = null;
            ctrl.searchParams.toDate = null;
            ctrl.historyList = [];
            ctrl.criteriaSelected = false;
            ctrl.rerenderDataTable();
        };

        ctrl.rerenderDataTable = function() {
            var pageInfo;
            if (ctrl.datatableObj.page != null) {
                pageInfo = ctrl.datatableObj.page.info();
            }
            ctrl.datatableObj = {};
            var historyList = angular.copy(ctrl.historyList);
            ctrl.historyList = [];
//            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.historyList = historyList;
                if (pageInfo != null) {
                    $timeout(function() {
                        var pageNo = Number(pageInfo.page);
                        if (ctrl.datatableObj.page.info().pages <= pageInfo.page) {
                            pageNo--;
                        }
                        ctrl.datatableObj.page(pageNo).draw(false);
                    }, 20);
                }
            });
        };

        ctrl.showPayrolls = function() {
            if (!ctrl.searchParams.fromDate || ctrl.searchParams.fromDate == "") {
                ctrl.searchParams.fromDate = null;
            }
            if (!ctrl.searchParams.toDate || ctrl.searchParams.toDate == "") {
                ctrl.searchParams.toDate = null;
            }
            if (ctrl.searchParams.fromDate !== null && ctrl.searchParams.toDate !== null) {
                ctrl.criteriaSelected = true;
                ctrl.retrievePayrollHistory();
            } else {
                ctrl.criteriaSelected = false;
                ctrl.historyList = [];
                ctrl.rerenderDataTable();
            }
        };

        ctrl.retrievePayrollHistory = function() {
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            PayrollDAO.getHistory(ctrl.searchParams).then(function(res) {
                ctrl.dataRetrieved = true;
                ctrl.historyList = res;
//		ctrl.historyList = [{batchNo: "13025", dateProcessed: "2008/11/28", grossPay: "10", totalEmployees: 2, totalHours: 20, payPeriod: "2008/11/28 To 2008/ 11/ 29"}];
                angular.forEach(ctrl.historyList, function(obj) {
                    obj.dateInserted = Date.parse(obj.dateInserted);
                    obj.sessionStartDate = Date.parse(obj.sessionStartDate);
                    obj.sessionEndDate = Date.parse(obj.sessionEndDate);
                });
                ctrl.rerenderDataTable();
            }).catch(function() {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                });
                toastr.error("Could not load data.");
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };
    }
    ;
    angular.module('xenon.controllers').controller('PayrollHistoryCtrl', ["$rootScope", "$scope", "$http", "PayrollDAO", "$timeout", "$state", PayrollHistoryCtrl]);
})();