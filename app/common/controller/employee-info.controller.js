(function () {
    function EmployeeInfoCtrl(employeeId, $rootScope, $modal, $modalInstance, EmployeeDAO) {
        var ctrl = this;

        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        $rootScope.maskLoading();

        EmployeeDAO.get({id: employeeId}).then(function (res) {
            ctrl.employee = angular.copy(res);
            if (ctrl.employee.languageSpoken != null && ctrl.employee.languageSpoken.length > 0) {
                ctrl.employee.languageSpoken = ctrl.employee.languageSpoken.split(",");
            }
            $rootScope.unmaskLoading();
        });
        
        EmployeeDAO.getNotes({employeeId: employeeId}).then(function (res) {
            ctrl.notes = angular.copy(res);
        });
        
        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeInfoCtrl', ["employeeId", "$rootScope", "$modal", "$modalInstance", "EmployeeDAO", EmployeeInfoCtrl]);
})();