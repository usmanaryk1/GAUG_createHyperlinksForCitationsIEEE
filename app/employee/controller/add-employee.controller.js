(function() {
    function AddEmployeeCtrl($scope, $rootScope, $http, $stateParams, $state, EmployeeDAO, $timeout) {
        var ctrl = this;
        ctrl.employee = {Wages: 'H', TaxStatus: 'W-2', position: 'Market Rep.'};
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
        } else if ($state.current.name.indexOf('tab1') > -1) {
            ctrl.editMode = false;
        } else {
            $state.transitionTo(ontimetest.defaultState);
        }
        ctrl.saveEmployee = saveEmployeeData;
        ctrl.pageInitCall = pageInit;
        ctrl.submitSave = false;

        ctrl.navigateToTab = function(state) {
            if ($('#add_employee_form').valid() || $('#add_employee_form').serialize() == form_clean) {
                if (ctrl.editMode) {
                    $state.go('^.' + state, {id: $state.params.id});
                }
            }

        }

        //function to save the employee data
        function saveEmployeeData() {
            setFormDynamicValidityMessages();
            if ($('#add_employee_form')[0].checkValidity()) {
                var reqParam;
                if (ctrl.employee.id && ctrl.employee.id !== null) {
                    reqParam = 'updateemployee';
                    if (ctrl.employee.employeeCareRatesList && ctrl.employee.employeeCareRatesList !== null) {
                        var careRateList = angular.copy(ctrl.employee.employeeCareRatesList);
                        careRateList.employeeId = ctrl.employee.id;
                        EmployeeDAO.updateCareRates(careRateList)
                                .then()
                                .catch(function() {
                                    console.log(JSON.stringify(careRateList));
                                })
                    }
                } else {
                    reqParam = 'saveemployee';
                }

                EmployeeDAO.update({action: reqParam, data: ctrl.employee})
                        .then(function(res) {
                            if(!ctrl.employee.id || ctrl.employee.id === null){
                                $state.go('^.tab1', {id: res.id});
                                ctrl.editMode = true;
                                ctrl.employee = res;
                            }
                        })
                        .catch(function() {
                            if(!ctrl.employee.id || ctrl.employee.id === null){
                                $state.go('^.tab1', {id: 1});
                                ctrl.editMode = true;
                                ctrl.employee.id = 1;
                            }
                            //exception logic
                            console.log('Employee2 Object : ' + JSON.stringify(ctrl.employee));
                        });

            }
        }
        ;

        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                EmployeeDAO.get({id: $state.params.id}).then(function(res) {
                    ctrl.employee = res;
                    $timeout(function() {
                        $("#rate2").multiSelect('refresh');
                        $("#rate1").multiSelect('refresh');
                    })
                }).catch(function(data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {

                        }
                    }); // showLoadingBar
                    ctrl.employee = ontimetest.employees[($state.params.id - 1)];
                    console.log(JSON.stringify(ctrl.employee))
                })
            }
        }


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
            } else {
                $("input[name='PhysicalExpirationDate']").attr('required', false);
            }
        });

        $scope.$watch(function() {
            return ctrl.employee.tbTesting;
        }, function(newVal, oldValue) {
            if (newVal && newVal !== '') {
                $("input[name='TBTestingExpirationDate']").attr('required', true);
            } else {
                $("input[name='TBTestingExpirationDate']").attr('required', false);
            }
        });

        function setRadioValues(name, newVal) {
            $("input[name='" + name + "'][value='" + newVal + "']").attr('checked', 'checked');
            $("input[name='" + name + "'][value='" + newVal + "']").parent().parent().addClass('cbr-checked');
        }

        ctrl.tab2DataInit = function() {
            if (!ctrl.employee.taxStatus || ctrl.employee.taxStatus===null) {
                ctrl.employee.taxStatus = 'W-2';
            }
            if (!ctrl.employee.wages) {
                ctrl.employee.wages = 'H';
            }
            setTimeout(function() {
                setRadioValues('TaxStatus', ctrl.employee.taxStatus || ctrl.employee.taxStatus===null);
                setRadioValues('Wages', ctrl.employee.wages);
            }, 100);

        };
        ctrl.tab1DataInit = function() {
            if(!$state.params.id || $state.params.id === ''){
                ctrl.editMode = false;
                ctrl.employee = {Wages: 'H', TaxStatus: 'W-2', position: 'Market Rep.'};
            }else{
                ctrl.editMode = true;
            }
            if (!ctrl.employee.position || ctrl.employee.position===null) {
                ctrl.employee.position = 'Market Rep.';
            }
            setTimeout(function() {
                setRadioValues('Position', ctrl.employee.position);
            }, 100);

        };
        $scope.$watch(function() {
            return ctrl.employee.position;
        }, function(newVal, oldValue) {
            setRadioValues('Position', newVal);
        });
        $scope.$watch(function() {
            return ctrl.employee.Wages;
        }, function(newVal, oldValue) {
            setRadioValues('Wages', newVal);
        });
        $scope.$watch(function() {
            return ctrl.employee.TaxStatus;
        }, function(newVal, oldValue) {
            setRadioValues('TaxStatus', newVal);
        });

        ctrl.pageInitCall();
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope", "$rootScope", "$http", "$stateParams", "$state", "EmployeeDAO", "$timeout", AddEmployeeCtrl]);
})();