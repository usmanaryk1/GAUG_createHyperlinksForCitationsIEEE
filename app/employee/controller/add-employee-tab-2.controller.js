(function() {
    function AddEmployeeTab2Ctrl($scope, $rootScope, $http) {
        var ctrl = this;
        $scope.wage='H'
        ctrl.employee2 = {};
        ctrl.employee2.Wages = 'H';
        ctrl.employee2.TaxStatus = 'W-2';
        ctrl.saveEmployeeTab2 = saveEmployeeTab2Data;
        function saveEmployeeTab2Data() {
            if ($('#add_employee_tab_2_form')[0].checkValidity()) {
                alert('Employee2 Object : ' + JSON.stringify(ctrl.employee2));
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeTab2Ctrl', ["$scope","$rootScope", "$http", AddEmployeeTab2Ctrl]);
})();