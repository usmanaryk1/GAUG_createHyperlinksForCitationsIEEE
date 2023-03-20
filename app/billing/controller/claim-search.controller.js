(function () {
    function ClaimSearchCtrl($rootScope, PatientDAO, BillingDAO, $state, Page) {
        var ctrl = this;
        Page.setTitle("Billing Session");
        ctrl.datatableObj = {};
        ctrl.limit = 10;
        ctrl.viewRecords = 10;
        var defaultSearchParams = {limit: 10, pageNo: 1, sortBy: 'id', order: 'desc'};
        ctrl.searchParams = angular.copy(defaultSearchParams);
        ctrl.criteriaSelected = false;
        ctrl.errorMsg = {};
        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
                ctrl.patientList = res;
            });
        }
        ;
        ctrl.pageChanged = function (pagenumber) {
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.retrieveSessions();
        };
        ctrl.resetFilters = function () {
            ctrl.claims = [];
            ctrl.criteriaSelected = false;
            ctrl.searchParams = angular.copy(defaultSearchParams);
            $("#patientId").select2("val", null);
        };
        ctrl.filterSessions = function () {
            ctrl.errorMsg = {};
            ctrl.searchParams.pageNo = 1;
            if (ctrl.searchParams.patientId != null || ctrl.searchParams.batchId != null || ctrl.searchParams.claimId != null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSessions();
            }
        };
        ctrl.retrieveSessions = function () {
            if (ctrl.criteriaSelected) {
                $rootScope.paginationLoading = true;
                $rootScope.maskLoading();
                ctrl.dataRetrieved = false;
                BillingDAO.searchClaims(ctrl.searchParams).then(function (res) {
                    ctrl.dataRetrieved = true;
                    ctrl.claims = res;
                }).catch(function (e) {
                    if (e.data != null) {
                        toastr.error(e.data);
                    } else {
                        toastr.error("Claims cannot be retrieved.");
                    }
                }).then(function () {
                    $rootScope.paginationLoading = false;
                    $rootScope.unmaskLoading();
                });
            }
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
    }
    angular.module('xenon.controllers').controller('ClaimSearchCtrl', ["$rootScope", "PatientDAO", "BillingDAO", "$state", "Page", ClaimSearchCtrl]);
})();
