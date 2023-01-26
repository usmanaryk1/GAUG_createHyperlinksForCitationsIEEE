(function () {
    function ViewEmployeesCtrl(EmployeeDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        $rootScope.selectEmployeeModel = {};
        if ($stateParams.status !== 'active' && $stateParams.status !== 'inactive' && $stateParams.status !== 'all') {
            $state.transitionTo(ontimetest.defaultState);
        } else {
            ctrl.viewType = $stateParams.status;
        }
        ctrl.retrieveEmployees = retrieveEmployeesData;
        ctrl.edit = edit;

        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll().then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                        if (res) {
                            ctrl.employeeList = res;
                        }
                    }
                }); // showLoadingBar

            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
                ctrl.employeeList = ontimetest.employees;
            });
        }

        function edit(employee) {
            $state.go('app.employee.tab1', {id: employee.id});
        }

        ctrl.retrieveEmployees();
        ctrl.openEditModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectEmployeeModel.employee = employee;

        };

        ctrl.openDeleteModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deactivateEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.deactivateEmployeeModel.employee = employee;

            $rootScope.deactivateEmployeeModel.deactivate = function (employee) {
                EmployeeDAO.delete({id: employee.id}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    $rootScope.deactivateEmployeeModel.close();
                }).catch(function (data, status) {
                    $rootScope.deactivateEmployeeModel.close();
                });
            };

        };
        ctrl.openDeactivateModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deactivateEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.deactivateEmployeeModel.employee = employee;

            $rootScope.deactivateEmployeeModel.deactivate = function (employee) {
                EmployeeDAO.deactivate({id: employee.id}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    $rootScope.deactivateEmployeeModel.close();
                }).catch(function (data, status) {
                    $rootScope.deactivateEmployeeModel.close();
                });
            };
        };
    }
    ;
    angular.module('xenon.controllers').controller('ViewEmployeesCtrl', ["EmployeeDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewEmployeesCtrl]);
})();