(function() {
    function AddEmployeeCtrl($scope, $stateParams, $state, EmployeeDAO, $timeout, $formService) {
        var ctrl = this;
        ctrl.retrivalRunning = false;
        ctrl.employee = {};
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
        } else if ($state.current.name.indexOf('tab1') > -1) {
            ctrl.employee = {}
            ctrl.editMode = false;
        } else {
            $state.transitionTo(ontimetest.defaultState);
        }
        ctrl.saveEmployee = saveEmployeeData;
        ctrl.pageInitCall = pageInit;
        var form_data;

        //ceck if form has been changed or not
        //If changed then it should be valid
        ctrl.navigateToTab = function(event, state) {
            if ($('#add_employee_form').serialize() !== form_data) {
                ctrl.formDirty = true;
            }
            if ($('#add_employee_form').valid() || !ctrl.formDirty) {
                if (ctrl.editMode) {
                    $state.go('^.' + state, {id: $state.params.id});
                }
            }
            event.stopPropagation();
        };

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
                            if (!ctrl.employee.id || ctrl.employee.id === null) {
                                $state.go('^.tab1', {id: res.id});
                                ctrl.editMode = true;
                                ctrl.employee.id = res.id;
                            }
                        })
                        .catch(function() {
                            if (!ctrl.employee.id || ctrl.employee.id === null) {
                                $state.go('^.tab1', {id: 1});
                                ctrl.editMode = true;
                                ctrl.employee.id = 1;
                            }
                            //exception logic
                            console.log('Employee2 Object : ' + JSON.stringify(ctrl.employee));
                        });

            }
        }

        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                ctrl.retrivalRunning = true;
                EmployeeDAO.get({id: $state.params.id}).then(function(res) {
                    ctrl.employee = res;
                    ctrl.retrivalRunning = false;
                    $timeout(function() {
                        $("#rate2").multiSelect('refresh');
                        $("#rate1").multiSelect('refresh');
                    }, 100);
                }).catch(function(data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {

                        }
                    }); // showLoadingBar
                    ctrl.employee = ontimetest.employees[($state.params.id - 1)];
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.employee))
                });
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

        ctrl.tab3DataInit = function() {
            ctrl.formDirty = false;
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab3DataInit();
                }
            }, 100);

        };

        ctrl.tab2DataInit = function() {
            ctrl.formDirty = false;

            //to set radio buttons on tab init..
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    $("#rate2").multiSelect('refresh');
                    $("#rate1").multiSelect('refresh');
                    if (!ctrl.employee.taxStatus || ctrl.employee.taxStatus === null) {
                        ctrl.employee.taxStatus = 'W-2';
                    }
                    if (!ctrl.employee.wages) {
                        ctrl.employee.wages = 'H';
                    }
                    $formService.setRadioValues('TaxStatus', ctrl.employee.taxStatus);
                    $formService.setRadioValues('Wages', ctrl.employee.wages);
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab2DataInit();
                }
            }, 100);

        };
        ctrl.tab1DataInit = function() {
            ctrl.formDirty = false;
            //to set edit mode in tab change
            if (!$state.params.id || $state.params.id === '') {
                ctrl.editMode = false;
                ctrl.employee = {};
            } else {
                ctrl.editMode = true;
            }
            //to set radio buttons on tab init..
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    if (!ctrl.employee.position || ctrl.employee.position === null) {
                        ctrl.employee.position = 'Market Rep.';
                    }
                    $formService.setRadioValues('Position', ctrl.employee.position);
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab1DataInit();
                }
            }, 100);

        };

//        $scope.$watch(function() {
//            return ctrl.employee.position;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('Position', newVal);
//        });
//        $scope.$watch(function() {
//            return ctrl.employee.Wages;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('Wages', newVal);
//        });
//        $scope.$watch(function() {
//            return ctrl.employee.TaxStatus;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('TaxStatus', newVal);
//        });

        ctrl.pageInitCall();
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope", "$stateParams", "$state", "EmployeeDAO", "$timeout", "$formService", AddEmployeeCtrl]);
})();