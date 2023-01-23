(function() {
    function PatientTimeSheetCtrl($scope, $rootScope, TimesheetDAO, PatientDAO) {
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

        ctrl.selectPatient = function(empObj) {
            ctrl.selectedPatient = empObj;
            ctrl.pat = empObj;
            ctrl.retrieveTimesheet();
        };

        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveAll().then(function(res) {
                ctrl.patientList = res;
                ctrl.selectPatient(ctrl.patientList[0]);
            }).catch(function(data, status) {
                ctrl.patientList = ontimetest.patients;
                ctrl.selectPatient(ctrl.patientList[0]);
            });
        }
        ;
    }
    ;
    angular.module('xenon.controllers').controller('PatientTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "PatientDAO", PatientTimeSheetCtrl]);
})();