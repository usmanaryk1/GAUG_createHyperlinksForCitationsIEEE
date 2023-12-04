(function () {
    function DailyAttendanceCtrl($timeout, $rootScope, TimesheetDAO, EmployeeDAO, $modal, $location, Page, $filter, EventTypeDAO) {
        var ctrl = this;
        Page.setTitle("Daily Attendance");
        ctrl.criteriaSelected = false;
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.isSchedule = false;
        //method is called when page is changed
        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.commonRetrieve();
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
            ctrl.commonRetrieve();
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
                ctrl.commonRetrieve();
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
            EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.NURSING_CARE_COORDINATOR + "," + ontimetest.positionGroups.STAFFING_COORDINATOR}).then(function (res) {
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
                    if (obj.scheduleId) {
                        obj.scheduleId.startTime = Date.parse(obj.scheduleId.startTime);
                        obj.scheduleId.endTime = Date.parse(obj.scheduleId.endTime);
                    }
                    if (obj.scheduleId && !obj.unauthorizedTime) {
                        obj.ut = $filter('ut')(obj.scheduleId.startTime, obj.scheduleId.endTime, obj.punchInTime, obj.punchOutTime);
                    }
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

        ctrl.openUTModal = function (timesheet, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.utModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.utModal.docFileObj = {};
            $rootScope.utModal.cancel = function () {
                $rootScope.utModal.close();
            };
            $rootScope.utModal.approve = function () {
                $rootScope.maskLoading();
                TimesheetDAO.approveUT($rootScope.utModal.obj).then(function (res) {
                    ctrl.rerenderDataTable();
                    toastr.success("Unauthorized Time approved.");
                    $rootScope.utModal.close();
                }).catch(function (data, status) {
                    toastr.error("Failed to approve Unsauthorized time.");
                    $rootScope.unmaskLoading();
                    $rootScope.utModal.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };
            $rootScope.utModal.documentUploadFile = {
                target: ontimetest.weburl + 'file/upload',
                chunkSize: 1024 * 1024 * 1024,
                testChunks: false,
                fileParameterName: "fileUpload",
                singleFile: true,
                headers: {
                    type: "u",
                    company_code: ontimetest.company_code
                }
            };
            //When file is selected from browser file picker
            $rootScope.utModal.documentFileSelected = function (file, flow) {
                $rootScope.utModal.docFileObj.flowObj = flow;
                $rootScope.utModal.docFileObj.flowObj.upload();
            };
            //When file is uploaded this method will be called.
            $rootScope.utModal.documentFileUploaded = function (response, file, flow) {
                if (response != null) {
                    response = JSON.parse(response);
                    if (response.fileName != null && response.status != null && response.status == 's') {
                        $rootScope.utModal.obj.unauthorizedDocument = response.fileName;
                    }
                }
                $rootScope.utModal.disableDocumentUploadButton = false;
            };
            $rootScope.utModal.documentFileError = function ($file, $message, $flow) {
                $flow.cancel();
                $rootScope.utModal.obj.unauthorizedDocument = null;
                $rootScope.utModal.disableDocumentUploadButton = false;
                $rootScope.utModal.docFileObj.errorMsg = "File cannot be uploaded";
            };
            //When file is added in file upload
            $rootScope.utModal.documentFileAdded = function (file, flow) { //It will allow all types of attahcments'
                $rootScope.utModal.formDirty = true;
                $rootScope.utModal.documentUploadFile.headers.fileExt = file.getExtension();
                if ($rootScope.validImageFileTypes.indexOf(file.getExtension()) < 0) {
                    $rootScope.utModal.docFileObj.errorMsg = "Please upload a valid file.";
                    return false;
                } else {
                    $("#cropper-example-2-modal").modal('show');
                }

                $rootScope.utModal.docFileObj.errorMsg = null;
                $rootScope.utModal.docFileObj.flow = flow;
                return true;
            };
            $rootScope.utModal.clearDocument = function () {
                if ($rootScope.utModal.obj.unauthorizedDocument != null) {
                    $rootScope.utModal.obj.unauthorizedDocument = null;
                }
                if ($rootScope.utModal.docFileObj.flowObj != null) {
                    $rootScope.utModal.docFileObj.flowObj.cancel();
                }
            };
            $rootScope.utModal.obj = {id: timesheet.id, unauthorizedTime: timesheet.ut, forPayroll: false, forBilling: false, isMissedPunch: timesheet.isMissedPunch};
        };
        ctrl.filterSchedule = function () {
            ctrl.searchParams.pageNo = 1;
            if (!ctrl.searchParams.startDate || ctrl.searchParams.startDate == "") {
                ctrl.searchParams.startDate = null;
            }
            if (!ctrl.searchParams.endDate || ctrl.searchParams.endDate == "") {
                ctrl.searchParams.endDate = null;
            }
            if (ctrl.searchParams.startDate !== null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSchedule();
            } else {
                ctrl.criteriaSelected = false;
                ctrl.attendanceList = [];
                ctrl.dataRetrieved = false;
            }
        }
        ctrl.retrieveSchedule = function () {

            $rootScope.paginationLoading = true;
            var params = angular.copy(ctrl.searchParams);
            params.fromDate = ctrl.searchParams.startDate;
            params.toDate = ctrl.searchParams.endDate;
            delete params.startDate;
            delete params.endDate;
            delete params.staffingCordinatorId;
            params.dailyAttendance = true;
            EventTypeDAO.retrieveSchedules(params).then(function (res) {
                ctrl.attendanceList = JSON.parse(res.data);
                angular.forEach(ctrl.attendanceList, function (obj) {
                    delete obj.color;
                    if (obj.timeSheet) {
                        var s1 = $filter('ampm')(obj.startTime);
                        var e1 = $filter('ampm')(obj.endTime);
                        var s11 = new Date(obj.startDate + " " + s1);
                        var e11 = new Date(obj.endDate + " " + e1);
                        var temp = $filter('ut')(s11, e11, obj.timeSheet.punchInTime, obj.timeSheet.punchOutTime);
                        obj.timeSheet.punchInTime = Date.parse(obj.timeSheet.punchInTime);
                        obj.timeSheet.punchOutTime = Date.parse(obj.timeSheet.punchOutTime);
                        if (temp) {
                            var t = temp.split(":");
                            var h = Number(t[0]);
                            var m = Number(t[1]);
                            if (h > 0 || m > 30) {
                                obj.color = "#ea9999";
                            } else if (h > 0 || m > 8) {
                                obj.color = "#FEFEB8";
                            }
                        }
                    }
                });
                ctrl.totalRecords = Number(res.headers.event_count);
                localStorage.setItem('dailyAttendanceSearchParams', JSON.stringify(ctrl.searchParams));
                ctrl.dataRetrieved = true;
            }).catch(function () {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.error("Could not load Schedule");
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });

        };
        ctrl.resetCheckbox = function () {
            ctrl.searchParams.pageNo = 1;
            ctrl.searchParams.sortBy = 'date';
            ctrl.searchParams.order = 'desc';
            ctrl.commonFilter();
            ctrl.formSubmitted = true;
        };
        ctrl.commonFilter = function () {
            if (ctrl.isSchedule) {
                ctrl.filterSchedule();
            } else {
                ctrl.filterTimesheet();
            }
        };
        ctrl.commonRetrieve = function () {
            if (ctrl.isSchedule) {
                ctrl.retrieveSchedule();
            } else {
                ctrl.retrieveTimesheet();
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('DailyAttendanceCtrl', ["$timeout", "$rootScope", "TimesheetDAO", "EmployeeDAO", "$modal", "$location", "Page", "$filter", "EventTypeDAO", DailyAttendanceCtrl]);
})();