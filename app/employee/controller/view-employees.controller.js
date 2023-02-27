(function () {
    function ViewEmployeesCtrl(EmployeeDAO, $rootScope, $stateParams, $state, $modal, $scope) {
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
            EmployeeDAO.retrieveAll({subAction: ctrl.viewType}).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.employeeList = res;
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve employees.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
                ctrl.employeeList = ontimetest.employees;
                console.log('Error in retrieving data')
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
            $rootScope.deleteEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.deleteEmployeeModel.employee = employee;

            $rootScope.deleteEmployeeModel.delete = function (employee) {
                EmployeeDAO.delete({id: employee.id}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Employee deleted.");
                    $rootScope.deleteEmployeeModel.close();
                }).catch(function (data, status) {
                    toastr.error("Failed to delete employee.");
                    $rootScope.deleteEmployeeModel.close();
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
                EmployeeDAO.changestatus({id: employee.id, status: 'inactive'}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Employee deactivated.");
                    $rootScope.deactivateEmployeeModel.close();
                }).catch(function (data, status) {
                    toastr.error("Employee cannot be deactivated.");
                    $rootScope.deactivateEmployeeModel.close();
                });
            };
        };
        ctrl.openActivateModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.activateEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.activateEmployeeModel.employee = employee;

            $rootScope.activateEmployeeModel.activate = function (employee) {
                EmployeeDAO.changestatus({id: employee.id, status: 'active'}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Employee activated.");
                    $rootScope.activateEmployeeModel.close();
                }).catch(function (data, status) {
                    toastr.error("Employee cannot be activated.");
                    $rootScope.activateEmployeeModel.close();
                });
            };
        };
//        
//        $scope.$watch(function() {
//            return ctrl.viewType;
//        }, function(newVal, oldValue) {
//            ctrl.employeeList = [];
//            ctrl.retrieveEmployees();
//        });
    }
    ;
    angular.module('xenon.controllers').controller('ViewEmployeesCtrl', ["EmployeeDAO", "$rootScope", "$stateParams", "$state", "$modal", "$scope", ViewEmployeesCtrl]);
})();
