(function() {
    function PayrollSessionCtrl($rootScope, $scope, $modal, $timeout, PayrollDAO, EmployeeDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.criteriaSelected = false;
        ctrl.processSessions = function() {
            if (ctrl.payrollSessions != null && ctrl.payrollSessions.length > 0) {
                $rootScope.maskLoading();
                PayrollDAO.processSessions(ctrl.payrollSessions).then(function(res) {
                    console.log(res);
                }).catch(function(e) {
                    toastr.error("Payroll sessions cannot be processed.");
                }).then(function() {
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
            });
        };
        ctrl.openPayrollModal = function(payroll, modal_id, modal_size, modal_backdrop) {
            $rootScope.payrollModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.payrollModal.empMap = ctrl.empMap;
            $rootScope.payrollModal.payrollObj = payroll;
        };
        ctrl.editNotes = function(note) {
            $('#modal-8').modal('show', {backdrop: 'static'});
            ctrl.notes = note;
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
            if (ctrl.payrollSettings[rateType] == 'OT') {
                payrollObj[rateKey] = payrollObj.otRate;
            }
        };
        ctrl.calculateGrossPay = function(payrollObj) {
            var grossPay = (checkNull(payrollObj.rate1) * checkNull(payrollObj.hour1)) + (checkNull(payrollObj.rate2) * checkNull(payrollObj.hour2)) + (checkNull(payrollObj.otRate) * checkNull(payrollObj.otHours) * 1.5) + (checkNull(payrollObj.hdRate) * checkNull(payrollObj.hdHours) * 1.5) + checkNull(payrollObj.earnings1099) + (checkNull(payrollObj.vacation) * checkNull(payrollObj.rate1)) + (checkNull(payrollObj.sick) * checkNull(payrollObj.rate1)) + (checkNull(payrollObj.personal) * checkNull(payrollObj.rate1)) + checkNull(payrollObj.bonusEarnings) + checkNull(payrollObj.miscEarnings) - checkNull(payrollObj.miscDeduction) - checkNull(payrollObj.loan) - checkNull(payrollObj.advanceDeduction);
            return grossPay;
        };

        ctrl.showAddEmployeeModal = function() {
            $('#modal-7').modal('show', {backdrop: 'static'});
//            setTimeout(function() {
//                console.log($(document).find("#sboxit-1").html());
//                $(document).find("#sboxit-1").select2({
//                    placeholder: 'Select Employee...',
//                }).on('select2-open', function()
//                {
//                    // Adding Custom Scrollbar
//                    $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
//                });
//            }, 200);
        };

        ctrl.initSessions = function() {
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
    angular.module('xenon.controllers').controller('PayrollSessionCtrl', ["$rootScope", "$scope", "$modal", "$timeout", "PayrollDAO", "EmployeeDAO", PayrollSessionCtrl]);
})();