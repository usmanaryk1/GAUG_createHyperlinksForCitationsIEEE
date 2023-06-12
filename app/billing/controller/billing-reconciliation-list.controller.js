/* global ontime_data, _ */

(function () {
    function BillingReconciliationListCtrl($state, $timeout, InsurerDAO, PatientDAO) {
        var ctrl = this;
        ctrl.show = 'filtered';
        ctrl.currentDate = new Date();
        ctrl.viewRecords = 10;
        ctrl.datatableObj = {};
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go(ctrl.type);
        }
        ctrl.changeViewRecords = function () {
            ctrl.datatableObj.page.len(ctrl.viewRecords).draw();
        };
        ctrl.rerenderDataTable = function () {
            ctrl.reconciliations = [];
            $("#reconciliations_wrapper").remove();
            $timeout(function () {
                ctrl.reconciliations = ontime_data.reconciliations;
                $timeout(function () {
                    $("#reconciliations").wrap("<div class='table-responsive'></div>");
                    ctrl.datatableObj.page.len(ctrl.viewRecords).draw();
                }, 50);
            });
        };
        ctrl.rerenderDataTable();
    }
    angular.module('xenon.controllers').controller('BillingReconciliationListCtrl', ["$state", "$timeout", "InsurerDAO", "PatientDAO", BillingReconciliationListCtrl]);
})();
