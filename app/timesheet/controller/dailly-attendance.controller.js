(function() {
    function DailyAttendanceCtrl($scope, $rootScope, TimesheetDAO) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
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
            if (ctrl.empName == "") {
                ctrl.empName = null;
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
                      if (ctrl.empName != null) {
                        if (data[1].toLowerCase()!=ctrl.empName.toLowerCase()) {
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
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        TimesheetDAO.retrieveAllDailyAttendance().then(function(res) {
            showLoadingBar({
                delay: .5,
                pct: 100,
                finish: function() {
                    if (res) {
                        ctrl.attendanceList = res;
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
            ctrl.attendanceList = ontimetest.dailyAttendance;
        });


    }
    ;
    angular.module('xenon.controllers').controller('DailyAttendanceCtrl', ["$scope", "$rootScope", "TimesheetDAO", DailyAttendanceCtrl]);
})();