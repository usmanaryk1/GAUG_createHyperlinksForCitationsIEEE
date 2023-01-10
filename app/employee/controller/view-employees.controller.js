(function() {
    function ViewEmployeesCtrl(EmployeeDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        $rootScope.selectEmployeeModel={};
        if ($stateParams.status !== 'active' && $stateParams.status !== 'inactive' && $stateParams.status !== 'all') {
            $state.transitionTo(ontimetest.defaultState);
        } else {
            ctrl.viewType = $stateParams.status;
        }
        this.employee = {Gender: 'M'};
        ctrl.retrieveEmployees = retrieveEmployeesData;
        ctrl.edit = edit;
        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll().then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        if (res) {
                            ctrl.employeeList = res;
                        }
                    }
                }); // showLoadingBar

            }).catch(function(data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        
                    }
                }); // showLoadingBar
                ctrl.employeeList = ontimetest.employees;
            });
        }
        ;
        ctrl.openEditModal = function(employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectEmployeeModel.employee=employee;

        };
        function edit(employee){
            alert(JSON.stringify(employee));
            ctrl.selectedEmployee = employee;
            $rootScope.openModal('modal-5');
        }
    }
    ;
    angular.module('xenon.controllers').controller('ViewEmployeesCtrl', ["EmployeeDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewEmployeesCtrl]);
})();