(function() {
    function AddEmployeeCtrl($scope, $rootScope, $http) {
        var ctrl = this;
        $scope.wage='H'
        ctrl.employee = {};
        ctrl.employee.Wages = 'H';
        ctrl.employee.TaxStatus = 'W-2';
        ctrl.saveEmployee = saveEmployeeData;
        function saveEmployeeData() {
            if ($('#add_employee_form')[0].checkValidity()) {
                alert('Employee2 Object : ' + JSON.stringify(ctrl.employee));
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope","$rootScope", "$http", AddEmployeeCtrl]);
})();