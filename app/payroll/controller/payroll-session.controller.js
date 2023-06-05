(function() {
    function PayrollSessionCtrl($rootScope, $scope, $modal, $timeout, PayrollDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.filterSessions = function() {
            if (!ctrl.searchParams.fromDate || ctrl.searchParams.fromDate == "") {
                ctrl.searchParams.fromDate = null;
            }
            if (!ctrl.searchParams.toDate || ctrl.searchParams.toDate == "") {
                ctrl.searchParams.toDate = null;
            }
            if (ctrl.searchParams.fromDate !== null && ctrl.searchParams.toDate !== null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSessions();
            } else {
                ctrl.criteriaSelected = false;
                ctrl.payrollSessions = [];
                ctrl.rerenderDataTable();
            }
        };
//        ctrl.payrollSessions = ontimetest.payrollSessions;
        ctrl.retrieveSessions = function() {
            $rootScope.maskLoading();
            PayrollDAO.getSessions(ctrl.searchParams).then(function(res) {
                ctrl.payrollSessions = res;
            }).catch(function(e) {
                toastr.error("Payroll sessions cannot be retrieved.");
            }).then(function() {
                $rootScope.unmaskLoading();
            })
        };
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };

        ctrl.rerenderDataTable = function() {
            ctrl.datatableObj = {};
            var payrollSessions = angular.copy(ctrl.payrollSessions);
            ctrl.payrollSessions = [];
            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.payrollSessions = payrollSessions;
            });
        };
        ctrl.openPayrollModal = function(payroll, modal_id, modal_size, modal_backdrop) {
            $rootScope.payrollModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.payrollModal.payroll = payroll;
        };
    }
    ;
    angular.module('xenon.controllers').controller('PayrollSessionCtrl', ["$rootScope", "$scope", "$modal", "$timeout", "PayrollDAO", PayrollSessionCtrl]);
})();