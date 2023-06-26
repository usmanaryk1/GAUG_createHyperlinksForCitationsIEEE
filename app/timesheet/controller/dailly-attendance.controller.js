(function() {
    function DailyAttendanceCtrl($timeout, $rootScope, TimesheetDAO, EmployeeDAO, $modal, $location) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.criteriaSelected = false;
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            $('#sboxit-2').select2('val', null);
            ctrl.searchParams.staffingCordinatorId = null;
            ctrl.selectedEmployee = null;
            ctrl.attendanceList = [];
            ctrl.criteriaSelected = false;
            ctrl.rerenderDataTable();
        };
        ctrl.rerenderDataTable = function() {
            ctrl.datatableObj = {};
            var attendanceList = angular.copy(ctrl.attendanceList);
            ctrl.attendanceList = [];
            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.attendanceList = attendanceList;
            });
//            ctrl.datatableObj = {};
//            var attendanceList = angular.copy(ctrl.attendanceList);
//            ctrl.attendanceList = [];
//            $("#example-1_wrapper").remove();
//            $timeout(function() {
//                ctrl.attendanceList = attendanceList;
//            });
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchParams.staffingCordinatorId && ctrl.searchParams.staffingCordinatorId !== null) {
                ctrl.cordinatorId = ctrl.searchParams.staffingCordinatorId;
                if (!ctrl.searchParams.startDate || ctrl.searchParams.startDate == "") {
                    ctrl.searchParams.startDate = null;
                }
                if (!ctrl.searchParams.endDate || ctrl.searchParams.endDate == "") {
                    ctrl.searchParams.endDate = null;
                }
                if (ctrl.searchParams.startDate !== null) {
                    ctrl.criteriaSelected = true;
                    ctrl.retrieveTimesheet();
                } else {
                    ctrl.criteriaSelected = false;
                    ctrl.attendanceList = [];
                    ctrl.rerenderDataTable();
                }

            } else {
                ctrl.cordinatorId = undefined;
                ctrl.attendanceList = [];
                ctrl.criteriaSelected = false;
                ctrl.rerenderDataTable();
            }

//            if (ctrl.searchParams.startDate === "") {
//                ctrl.searchParams.startDate = null;
//            }
//            if (ctrl.searchParams.endDate === "") {
//                ctrl.searchParams.endDate = null;
//            }
//            ctrl.retrieveTimesheet();
//            ctrl.datatableObj.fnDraw();
        }
        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveByPosition({'position': 'a,nc'}).then(function(res) {
                ctrl.employeeList = res;
                var params = $location.search();
                if (params != null && params.id != null) {
                    ctrl.searchParams.staffingCordinatorId = Number(params.id);
                    $timeout(function() {
                        $("#sboxit-2").select2("val", params.id);
                    }, 300);
                    if (params.from != null) {
                        ctrl.searchParams.startDate = params.from;
                    }
                    if (params.to != null) {
                        ctrl.searchParams.endDate = params.to;
                    }
                    ctrl.filterTimesheet();
                }

            }).catch(function(data, status) {
                toastr.error("Could not load Coordinators");
//                ctrl.employeeList = ontimetest.employees;
            });
        }

        ctrl.retrieveTimesheet = function() {
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            if (ctrl.searchParams.staffingCordinatorId != null && ctrl.searchParams.startDate != null) {
                $location.search({id: ctrl.searchParams.staffingCordinatorId, from: ctrl.searchParams.startDate, to: ctrl.searchParams.endDate});
            }
            TimesheetDAO.retrieveAllDailyAttendance(ctrl.searchParams).then(function(res) {
                ctrl.attendanceList = res;
                angular.forEach(ctrl.attendanceList, function(obj) {
                    obj.roundedPunchInTime = Date.parse(obj.roundedPunchInTime);
                    obj.roundedPunchOutTime = Date.parse(obj.roundedPunchOutTime);
                });
                ctrl.rerenderDataTable();
            }).catch(function() {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
                toastr.error("Could not load Daily Attendance");
            }).then(function() {
                $rootScope.unmaskLoading();
            });

        };
        ctrl.openTaskListModal = function(modal_id, modal_size, modal_backdrop, tasks)
        {
            ctrl.taskListModalOpen = true;
            $rootScope.taskListModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
//            $rootScope.taskListModal.taskList = [{label: "Slicing", value: false}, {label: "WooCommerce", value: true}, {label: "Programming", value: false}, {label: "SEO Optimize", value: true}];
            $rootScope.taskListModal.taskList = tasks;

        };

        ctrl.openDeleteModal = function(punchObj, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePunchModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deletePunchModal.punchObj = punchObj;

            $rootScope.deletePunchModal.delete = function(punchObj) {
                $rootScope.maskLoading();
                TimesheetDAO.delete({id: punchObj.id}).then(function(res) {
                    var length = ctrl.attendanceList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.attendanceList[i].id === punchObj.id) {
                            ctrl.attendanceList.splice(i, 1);
                            break;
                        }
                    }
                    ctrl.rerenderDataTable();
                    toastr.success("Punch record deleted.");
                    $rootScope.deletePunchModal.close();
                }).catch(function(data, status) {
                    toastr.error("Failed to delete punch record.");
                    $rootScope.deletePunchModal.close();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            };

        };


    }
    ;
    angular.module('xenon.controllers').controller('DailyAttendanceCtrl', ["$timeout", "$rootScope", "TimesheetDAO", "EmployeeDAO", "$modal", "$location", DailyAttendanceCtrl]);
})();