(function () {
    function DashboardCtrl(Page, $rootScope, $modal, $timeout, UserDAO) {
        var ctrl = this;
        Page.setTitle("Dashboard");
        $rootScope.isAdminPortal = false;    }
    ;
    angular.module('xenon.controllers').controller('DashboardCtrl', ["Page", "$rootScope", "$modal", "$timeout", "UserDAO", DashboardCtrl]);
})();
