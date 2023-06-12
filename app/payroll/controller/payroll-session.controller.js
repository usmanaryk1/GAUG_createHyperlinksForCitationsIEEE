(function() {
    function PayrollSessionCtrl($rootScope, $scope, $modal, $timeout, PayrollDAO, EmployeeDAO, $state) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.criteriaSelected = false;
        ctrl.processSessions = function() {
            ctrl.processClicked = true;
            if (ctrl.payrollSessions != null && ctrl.payrollSessions.length > 0) {
                $rootScope.maskLoading();
                PayrollDAO.processSessions(ctrl.searchParams, ctrl.payrollSessions).then(function(res) {
                    console.log(res);
                    $state.go('app.batch_session', {id: res.id});
                }).catch(function(e) {
                    toastr.error("Payroll sessions cannot be processed.");
                }).then(function() {
                    ctrl.processClicked = false;
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.filterSessions = function() {
            if (!ctrl.searchParams.fromDate || ctrl.searchParams.fromDate == "") {
                ctrl.searchParams.fromDate = null;
            }
            if (!ctrl.searchParams.toDate || ctrl.searchParams.toDate == "") {
                ctrl.searchParams.toDate = null;
            }
            if (ctrl.searchParams.fromDate != null && ctrl.searchParams.toDate != null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSessions();
            } else {
                ctrl.criteriaSelected = false;
                ctrl.payrollSessions = [];
                ctrl.rerenderDataTable();
            }
        };
        //        ctrl.payrollSessions = ontimetest.payrollSessions;
        ctrl.retrieveSessions = function() {
            if (ctrl.criteriaSelected) {
                $rootScope.maskLoading();
                ctrl.dataRetrieved = false;
                PayrollDAO.reviewSessions(ctrl.searchParams).then(function(res) {
                    ctrl.dataRetrieved = true;
                    ctrl.payrollSessions = res;
//                    ctrl.payrollSessions = ontimetest.payrollSessions;
                    angular.forEach(ctrl.payrollSessions, function(payrollObj) {
                        ctrl.setRates('vacation', 'vaccationRate', payrollObj);
                        ctrl.setRates('sick', 'sickRate', payrollObj);
                        ctrl.setRates('personal', 'personalRate', payrollObj);
                        payrollObj.grossPay = ctrl.calculateGrossPay(payrollObj);
                    });
                }).catch(function(e) {
                    toastr.error("Payroll sessions cannot be retrieved.");
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            }
        };
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };

        ctrl.rerenderDataTable = function() {
            ctrl.datatableObj = {};
            var payrollSessions = angular.copy(ctrl.payrollSessions);
            ctrl.payrollSessions = [];
            $("#example-1_wrapper").remove();

            $timeout(function() {
                ctrl.payrollSessions = payrollSessions;
//                $timeout(function() {
//                    $("#example-1").wrap("<div class='table-responsive'></div>");
//                }, 50);

            });
        };
        ctrl.openPayrollModal = function(payroll, modal_id, modal_size, modal_backdrop) {
            $rootScope.payrollModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: false
            });
            $rootScope.payrollModal.processdMode = ctrl.processdMode;
            var selectedPayroll = angular.copy(payroll);
            $rootScope.payrollModal.empMap = ctrl.empMap;
            $rootScope.payrollModal.payrollObj = payroll;
            var payroll_form_data;
            $timeout(function() {
                payroll_form_data = $('#payroll_form').serialize();
            });
            $rootScope.payrollModal.save = function() {
                $rootScope.payrollModal.payrollObj.grossPay = ctrl.calculateGrossPay($rootScope.payrollModal.payrollObj);
                $rootScope.payrollModal.close();
            };
            $rootScope.payrollModal.cancel = function() {
                if (payroll_form_data != $('#payroll_form').serialize()) {
                    for (var i = 0; i < ctrl.payrollSessions.length; i++) {
                        if (ctrl.payrollSessions[i].employeeId == $rootScope.payrollModal.payrollObj.employeeId) {
                            ctrl.payrollSessions[i] = selectedPayroll;
                            ctrl.rerenderDataTable();
                            break;
                        }
                    }
                    ;
                }
                ;
                $rootScope.payrollModal.close();
            };
        };
        ctrl.editNotes = function(session) {
            ctrl.notes = angular.copy(session.notes);
            $('#modal-8').modal('show', {backdrop: 'static'});
            ctrl.selectedSession = session;
//            ctrl.notes = session.notes;
        };
        ctrl.closeNotes = function() {
            ctrl.selectedSession.notes = ctrl.notes;
            $('#modal-8').modal('hide');
        };
        ctrl.saveNotes = function() {
            $('#modal-8').modal('hide');
        };
        var checkNull = function(value) {
            if (value == null) {
                return 0;
            } else {
                return value;
            }
        };
        ctrl.setRates = function(rateKey, rateType, payrollObj) {
            if (ctrl.payrollSettings[rateType] == 'R1') {
                payrollObj[rateKey] = payrollObj.rate1;
            }
            if (ctrl.payrollSettings[rateType] == 'R2') {
                payrollObj[rateKey] = payrollObj.rate2;
            }
        };
        ctrl.setGrossPay = function(payrollObj) {
            payrollObj.grossPay = ctrl.calculateGrossPay(payrollObj);
        };
        ctrl.calculateGrossPay = function(payrollObj) {
            var grossPay = (checkNull(payrollObj.rate1) * checkNull(payrollObj.hour1)) + (checkNull(payrollObj.rate2) * checkNull(payrollObj.hour2)) + (checkNull(payrollObj.otRate) * checkNull(payrollObj.otHours) * 1.5) + (checkNull(payrollObj.hdRate) * checkNull(payrollObj.hdHours) * 1.5) + checkNull(payrollObj.earnings1099) + (checkNull(payrollObj.vacation) * checkNull(payrollObj.rate1)) + (checkNull(payrollObj.sick) * checkNull(payrollObj.rate1)) + (checkNull(payrollObj.personal) * checkNull(payrollObj.rate1)) + checkNull(payrollObj.bonusEarnings) + checkNull(payrollObj.miscEarnings) - checkNull(payrollObj.miscDeduction) - checkNull(payrollObj.loan) - checkNull(payrollObj.advanceDeduction);
            return grossPay;
        };

        ctrl.showAddEmployeeModal = function() {
            $('#modal-7').modal('show', {backdrop: 'static'});
            ctrl.addEmployeeList = [];
            var empWithSessions = [];
            ctrl.employeeModalObj = {};
            ctrl.payrollFormSubmitted = false;
            angular.forEach(ctrl.payrollSessions, function(payroll) {
                empWithSessions.push(payroll.employeeId);
            });
            angular.forEach(ctrl.employeeList, function(emp) {
                if (empWithSessions.indexOf(emp.id) < 0) {
                    ctrl.addEmployeeList.push(emp);
                }
            });
            setTimeout(function() {
                $("#sboxit-1").select2({
                    placeholder: 'Select Employee...',
                }).on('select2-open', function()
                {
                    // Adding Custom Scrollbar
                    $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                });
            }, 200);
        };
        ctrl.selectEmployee = function() {
            var empObj = angular.copy(ctrl.empMap[ctrl.employeeModalObj.employeeId]);
            ctrl.employeeModalObj.otRate = empObj.otRate;
            ctrl.employeeModalObj.hdRate = empObj.hdRate;
            EmployeeDAO.retrieveEmployeeCareRates({employee_id: empObj.id}).then(function(res) {
                ctrl.employeeModalObj.rate1 = res.rate1.rate;
                ctrl.employeeModalObj.rate2 = res.rate2.rate;
            });
            ctrl.setGrossPay(ctrl.employeeModalObj);
        };
        ctrl.addEmployee = function() {
            ctrl.payrollFormSubmitted = true;
            if ($("#addEmployeeForm")[0].checkValidity() && ctrl.employeeModalObj.employeeId != null) {
                ctrl.setRates('vacation', 'vaccationRate', ctrl.employeeModalObj);
                ctrl.setRates('sick', 'sickRate', ctrl.employeeModalObj);
                ctrl.setRates('personal', 'personalRate', ctrl.employeeModalObj);
                if (ctrl.payrollSessions == null) {
                    ctrl.payrollSessions = [];
                }
                ctrl.employeeModalObj.manuallyAdded = true;
                ctrl.payrollSessions.push(ctrl.employeeModalObj);
                ctrl.rerenderDataTable();
                $('#modal-7').modal('hide');
            }
        };

        ctrl.initSessions = function() {
            if ($state.params.id && $state.params.id !== '') {
                ctrl.processdMode = true;
                ctrl.batchId = $state.params.id;
                $rootScope.maskLoading();
                PayrollDAO.getProcessedSessions({id: ctrl.batchId}).then(function(res) {
                    ctrl.processedSessionObj = res;
                    ctrl.payrollSessions = res.payrollList;
                    ctrl.totalGrossPay = 0;
                    angular.forEach(res.payrollList, function(payroll) {
                        ctrl.totalGrossPay += payroll.grossPay;
                    });
                    ctrl.processedSessionObj.sessionStartDate = Date.parse(ctrl.processedSessionObj.sessionStartDate);
                    ctrl.processedSessionObj.sessionEndDate = Date.parse(ctrl.processedSessionObj.sessionEndDate);
                    ctrl.rerenderDataTable();
                }).catch(function(e) {
                    toastr.error("Payroll cannot be retrieved.");
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            } else {
                ctrl.processdMode = false;
            }

            EmployeeDAO.retrieveAll({subAction: 'active'}).then(function(res) {
                ctrl.employeeList = res;
                ctrl.empMap = {};
                angular.forEach(res, function(emp) {
                    ctrl.empMap[emp.id] = emp;
                });
            }).catch(function(data, status) {
                console.log('Error in retrieving data')
            }).then(function() {
                $rootScope.unmaskLoading();
            });
            PayrollDAO.getSettings().then(function(res) {
                if (res != null) {
                    ctrl.payrollSettings = res;
                }
            }).catch(function() {
                console.log("Payroll settings cannot be retrieved.");
            });
        };
        ctrl.initSessions();
//        alert(ctrl.calculateGrossPay(ontimetest.payrollSessions[0]));

    }
    ;
    angular.module('xenon.controllers').controller('PayrollSessionCtrl', ["$rootScope", "$scope", "$modal", "$timeout", "PayrollDAO", "EmployeeDAO", "$state", PayrollSessionCtrl]);
})();