(function() {
    function PayrollHistoryCtrl($rootScope, $scope, $http, $modal, $timeout) {
        var ctrl = this;
        ctrl.historyList = [{batchNo: "13025", dateProcessed: "2008/11/28", grossPay: "10", totalEmployees: 2, totalHours: 20, payPeriod: "2008/11/28 To 2008/ 11/ 29"}];

    }
    ;
    angular.module('xenon.controllers').controller('PayrollHistoryCtrl', ["$rootScope", "$scope", "$http", "$modal", "$timeout", PayrollHistoryCtrl]);
})();