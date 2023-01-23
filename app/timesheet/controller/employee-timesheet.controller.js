(function() {
    function EmployeeTimeSheetCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchValue == "") {
                ctrl.searchVallue = null;
            }
            if (ctrl.fromDate == "") {
                ctrl.fromDate = null;
            }
            if (ctrl.toDate == "") {
                ctrl.toDate = null;
            }
            ctrl.datatableObj.fnDraw();
        };
        $.fn.dataTable.ext.search.push(
                function(settings, data, dataIndex) {
                    if (ctrl.searchValue != null) {
                        var dataToCompare = data.toString().toLowerCase();
                        if (dataToCompare.indexOf(ctrl.searchValue.toLowerCase()) < 0) {
                            return false;
                        }
                    }
                    if (ctrl.fromDate == null && ctrl.toDate == null) {
                        return true;
                    }
                    var date = new Date(data[0]);
                    if (ctrl.fromDate != null) {
                        if (date.getTime() < new Date(ctrl.fromDate).getTime()) {
                            return false;
                        }
                    }
                    if (ctrl.toDate != null) {
                        if (date.getTime() > new Date(ctrl.toDate).getTime()) {
                            return false;
                        }
                    }
                    return true;
                }
        );
        ctrl.retrieveTimesheet = function() {
            TimesheetDAO.query().then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        if (res) {
                            ctrl.timesheetList = res;
                        }
                    }
                }); // showLoadingBar
            }).catch(function() {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
                ctrl.timesheetList = ontimetest.employeeTimesheet;
            });
        };

        ctrl.selectEmployee = function(empObj) {
            console.log(empObj);
            ctrl.selectedEmployee = empObj;
            ctrl.emp = empObj;
            ctrl.retrieveTimesheet();
        };

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll().then(function(res) {
                ctrl.employeeList = res;
                ctrl.selectEmployee(ctrl.employeeList[0]);
            }).catch(function(data, status) {
                ctrl.employeeList = ontimetest.employees;
                ctrl.selectEmployee(ctrl.employeeList[0]);
            });
        }
        ;
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", EmployeeTimeSheetCtrl]);
})();