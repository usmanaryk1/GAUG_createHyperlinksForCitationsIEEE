(function() {
    function AddEmployeeCtrl($scope, $rootScope, $http) {
        var ctrl = this;
        ctrl.employee = {Wages: 'H', TaxStatus: 'W-2'};
        ctrl.saveEmployee = saveEmployeeData;
        ctrl.submitSave = false;
        function saveEmployeeData() {
            setFormDynamicValidityMessages();
            if ($('#add_employee_form')[0].checkValidity()) {
                console.log('Employee2 Object : ' + JSON.stringify(ctrl.employee));
            }
        }
        ;

//        These needs to be done for dynamic validations. It creates issue because of data-validate directive which applies to static form only
        function setFormDynamicValidityMessages() {
            $("#TBTestingExpirationDate-error").text('Please enter TB Testing Expiration Date.');
            $("#PhysicalExpirationDate-error").text('Please enter Physical Expiration Date.');
        }
        
        $scope.$watch(function() {
            return ctrl.employee.physical;
        }, function(newVal, oldValue) {
            if (newVal && newVal !== '') {
                $("input[name='PhysicalExpirationDate']").attr('required', true);
//                $("input[name='PhysicalExpirationDate']").attr('aria-required',true);
//                $("input[name='PhysicalExpirationDate']").attr('aria-invalid',true);
            } else {
                $("input[name='PhysicalExpirationDate']").attr('required', false);
//                $("input[name='PhysicalExpirationDate']").attr('aria-required',false);
            }
        });

        $scope.$watch(function() {
            return ctrl.employee.tbTesting;
        }, function(newVal, oldValue) {
            if (newVal && newVal !== '') {
                $("input[name='TBTestingExpirationDate']").attr('required', true);
//                $("input[name='PhysicalExpirationDate']").attr('aria-required',true);
//                $("input[name='PhysicalExpirationDate']").attr('aria-invalid',true);
            } else {
                $("input[name='TBTestingExpirationDate']").attr('required', false);
//                $("input[name='PhysicalExpirationDate']").attr('aria-required',false);
            }
        });

    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope", "$rootScope", "$http", AddEmployeeCtrl]);
})();