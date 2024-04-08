(function () {
    function AdminDashboardCtrl(Page, $rootScope) {
        var ctrl = this;
        Page.setTitle("Dashboard");
    }
    ;
    angular.module('xenon.controllers').controller('AdminDashboardCtrl', ["Page", "$rootScope", AdminDashboardCtrl]);
})();
