(function() {
    function DashboardCtrl(Page) {
        var ctrl = this;
        Page.setTitle("Dashboard");
    }
    ;
    angular.module('xenon.controllers').controller('DashboardCtrl', ["Page", DashboardCtrl]);
})();
