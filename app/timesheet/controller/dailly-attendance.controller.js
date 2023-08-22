(function () {
    function DailyAttendanceCtrl($timeout, $rootScope, TimesheetDAO, EmployeeDAO, $modal, $location, Page) {
        var ctrl = this;
        Page.setTitle("Daily Attendance");
        ctrl.criteriaSelected = false;
        ctrl.companyCode = ontimetest.company_code;

        //method is called when page is changed
        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.retrieveTimesheet();
        };

        //to apply sorting and manage variables
        ctrl.applySorting = function (sortBy) {
            if (ctrl.searchParams.sortBy !== sortBy) {
                ctrl.searchParams.sortBy = sortBy;
                ctrl.searchParams.order = "asc";
            } else {
                if (ctrl.searchParams.order === "desc") {
                    ctrl.searchParams.order = "asc";
                } else {
                    ctrl.searchParams.order = "desc";
                }
            }
            ctrl.retrieveTimesheet();
        };

        //to maintain sorting class dynamically
        ctrl.applySortingClass = function (sortBy) {
            if (ctrl.searchParams.sortBy !== sortBy) {
                return 'sorting';
            } else {
                if (ctrl.searchParams.order === "desc") {
                    return 'sorting_desc';
                } else {
                    return 'sorting_asc';
                }
            }
        };

        ctrl.resetFilters = function () {
            ctrl.searchParams = {limit: 10, pageNo: 1};
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            $('#sboxit-2').select2('val', null);
            ctrl.searchParams.staffingCordinatorId = null;
            localStorage.removeItem('dailyAttendanceSearchParams');
            ctrl.attendanceList = [];
            ctrl.criteriaSelected = false;
        };

        ctrl.rerenderDataTable = function () {
            if (ctrl.attendanceList.length === 0) {
                if (ctrl.searchParams.pageNo > 1) {
                    ctrl.pageChanged(ctrl.searchParams.pageNo - 1);
                }
            } else {
                ctrl.retrieveTimesheet();
            }
        };

        //this is called on review button click. As It is checking for mandatory fields and reinitialize the pageNo
        ctrl.filterTimesheet = function () {
            ctrl.searchParams.pageNo = 1;
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
                ctrl.dataRetrieved = false;
            }
        }
        retrieveEmployeesData();
        function retrieveEmployeesData() {
            $rootScope.maskLoading();
            EmployeeDAO.retrieveByPosition({'position': 'a,nc'}).then(function (res) {
                ctrl.employeeList = res;
                var params = localStorage.getItem('dailyAttendanceSearchParams');
                if (params !== null) {
                    ctrl.searchParams = JSON.parse(params);
                    $timeout(function () {
                        $("#sboxit-2").select2("val", ctrl.searchParams.staffingCordinatorId);
                    }, 300);
                    ctrl.filterTimesheet();
                } else {
                    ctrl.resetFilters();
                    $rootScope.unmaskLoading();
                }
            }).catch(function (data, status) {
                toastr.error("Could not load Coordinators");
                $rootScope.unmaskLoading();
//                ctrl.employeeList = ontimetest.employees;
            });
        }

        ctrl.retrieveTimesheet = function () {

            $rootScope.paginationLoading = true;
            TimesheetDAO.retrieveAllDailyAttendance(ctrl.searchParams).then(function (res) {
                ctrl.attendanceList = JSON.parse(res.data);
                ctrl.totalRecords = Number(res.headers.count);
                localStorage.setItem('dailyAttendanceSearchParams', JSON.stringify(ctrl.searchParams));
                angular.forEach(ctrl.attendanceList, function (obj) {
                    obj.roundedPunchInTime = Date.parse(obj.roundedPunchInTime);
                    obj.roundedPunchOutTime = Date.parse(obj.roundedPunchOutTime);
                });
                ctrl.dataRetrieved = true;
            }).catch(function () {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
                toastr.error("Could not load Daily Attendance");
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });

        };
        ctrl.openTaskListModal = function (modal_id, modal_size, modal_backdrop, tasks)
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

        ctrl.openDeleteModal = function (punchObj, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePunchModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deletePunchModal.punchObj = punchObj;

            $rootScope.deletePunchModal.delete = function (punchObj) {
                $rootScope.maskLoading();
                if (punchObj.isMissedPunch) {
                    TimesheetDAO.deleteMissedPunch({id: punchObj.id}).then(function (res) {
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
                    }).catch(function (data, status) {
                        toastr.error("Failed to delete punch record.");
                        $rootScope.deletePunchModal.close();
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                } else {
                    TimesheetDAO.delete({id: punchObj.id}).then(function (res) {
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
                    }).catch(function (data, status) {
                        toastr.error("Failed to delete punch record.");
                        $rootScope.deletePunchModal.close();
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }
            };
        };
    }
    ;
    angular.module('xenon.controllers').controller('DailyAttendanceCtrl', ["$timeout", "$rootScope", "TimesheetDAO", "EmployeeDAO", "$modal", "$location", "Page", DailyAttendanceCtrl]);
})();