(function() {
    function PayrollSessionCtrl($rootScope, $scope, $http, $modal, $timeout) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.payrollSessions = ontimetest.payrollSessions;

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
    angular.module('xenon.controllers').controller('PayrollSessionCtrl', ["$rootScope", "$scope", "$http", "$modal", "$timeout", PayrollSessionCtrl]);
})();