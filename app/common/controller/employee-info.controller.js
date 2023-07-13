(function () {
    function EmployeeInfoCtrl(employeeId, $rootScope, $modal, $modalInstance, EmployeeDAO) {
        var ctrl = this;

        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        ctrl.calledOnce = false;
        $rootScope.maskLoading();
        ctrl.employeeId = employeeId;
        EmployeeDAO.get({id: employeeId}).then(function (res) {
            ctrl.employee = angular.copy(res);
            if (ctrl.employee.languageSpoken != null && ctrl.employee.languageSpoken.length > 0) {
                ctrl.employee.languageSpoken = ctrl.employee.languageSpoken.split(",");
            }
            $rootScope.unmaskLoading();
        });
        
        ctrl.readNotes = function (isProfile) {
            if(!isProfile && !ctrl.calledOnce){
                ctrl.calledOnce = true;
                EmployeeDAO.readNotes({userId: employeeId}).then(function (res) {
                    console.log("read documents", res);
                });
            }            
        };
        
        ctrl.close = function () {
            $modalInstance.close(ctrl.calledOnce);
        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeInfoCtrl', ["employeeId", "$rootScope", "$modal", "$modalInstance", "EmployeeDAO", EmployeeInfoCtrl]);
})();