(function () {
    function EmployeeNotesCtrl(employeeId, $rootScope, $modal, $modalInstance, EmployeeDAO) {
        var ctrl = this;

        $rootScope.maskLoading();

        ctrl.employeeId = employeeId;

        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeNotesCtrl', ["employeeId", "$rootScope", "$modal", "$modalInstance", "EmployeeDAO", EmployeeNotesCtrl]);
})();