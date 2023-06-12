/* global ontime_data, _ */

(function () {
    function BillingReconciliationCtrl($state, $timeout, InsurerDAO, PatientDAO) {
        console.log("$state", $state);
        var ctrl = this;
        ctrl.title = $state.current.data && $state.current.data.title ? $state.current.data.title : null;
        ctrl.show = 'filtered';
        ctrl.selectedClaims = {};
        ctrl.currentDate = new Date();
        ctrl.viewRecords = 5;
        ctrl.filteredDatatableObj = {};
        ctrl.selectedDatatableObj = {};
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go(ctrl.type);
        }
        ctrl.getlength = function (object) {
            return Object.keys(object).length;
        };
//        ctrl.changeSelected = function(){
//            ctrl.selectedClaims = _.filter(ontime_data.claims,function(claim){
//                return ctrl.selectedClaims[claim.id];
//            });
//        };
        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.insuranceProviderList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        PatientDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
            ctrl.patientList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve patient list.");
        });
        ctrl.changeViewRecords = function () {
            ctrl.filteredDatatableObj.page.len(ctrl.viewRecords).draw();
        };
        ctrl.rerenderFilterDataTable = function () {
            ctrl.claims = [];
            $("#filtered-claims_wrapper").remove();
            $timeout(function () {
                ctrl.claims = ontime_data.claims;
                $timeout(function () {
                    $("#filtered-claims").wrap("<div class='table-responsive'></div>");
                    ctrl.filteredDatatableObj.page.len(ctrl.viewRecords).draw();
                }, 50);
            });
        };
        ctrl.rerenderFilterDataTable();
        ctrl.rerenderSelectedDataTable = function () {
            if (ctrl.show === 'selected') {
                ctrl.selectedClaims = [];
                $("#selected-claims_wrapper").remove();
                $timeout(function () {
                    ctrl.selectedClaims = _.filter(ontime_data.claims, function (claim) {
                        return ctrl.selectedClaims[claim.id];
                    });
                    $timeout(function () {
                        $("#selected-claims").wrap("<div class='table-responsive'></div>");
                        ctrl.selectedDatatableObj.page.len(ctrl.viewRecords).draw();
                    }, 50);
                });
            }
        };
//        ctrl.rerenderSelectedDataTable();
    }
    angular.module('xenon.controllers').controller('BillingReconciliationCtrl', ["$state", "$timeout", "InsurerDAO", "PatientDAO", BillingReconciliationCtrl]);
})();
