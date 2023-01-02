(function() {
    function AddEmployeeCtrl($scope, $rootScope, $http) {
        var ctrl = this;
        $scope.wage='H'
        ctrl.employee = {};
        ctrl.employee.Wages = 'H';
        ctrl.employee.TaxStatus = 'W-2';
        ctrl.saveEmployeeTab2 = saveEmployeeTab2Data;
        function saveEmployeeTab2Data() {
            if ($('#add_employee_tab_2_form')[0].checkValidity()) {
                alert('Employee2 Object : ' + JSON.stringify(ctrl.employee));
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope","$rootScope", "$http", AddEmployeeCtrl]);
})();