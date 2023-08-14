(function() {
    function EmployeeTimeSheetCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, $modal, $timeout, $location, Page) {
        var ctrl = this;
        Page.setTitle("Employee Timesheet");
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.criteriaSelected = false;
        ctrl.employeeIdMap = {};
        ctrl.employeeList = [];

        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.page.len(ctrl.viewRecords).draw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            $('#sboxit-2').select2('val', null);
            ctrl.selectedEmployee = null;
            ctrl.timesheetList = [];
            ctrl.criteriaSelected = false;
            ctrl.searchParams.employeeId = null;
            ctrl.rerenderDataTable();
        };
        ctrl.rerenderDataTable = function() {
            var pageInfo;
            if (ctrl.datatableObj.page != null) {
                pageInfo = ctrl.datatableObj.page.info();
            }
            ctrl.datatableObj = {};
            var timesheetList = angular.copy(ctrl.timesheetList);
            ctrl.timesheetList = [];
            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.timesheetList = timesheetList;
                if (pageInfo != null) {
                    $timeout(function() {
                        var pageNo = Number(pageInfo.page);
                        if (ctrl.datatableObj.page.info().pages <= pageInfo.page) {
                            pageNo--;
                        }
                        ctrl.datatableObj.page(pageNo).draw(false);
                    }, 20);
                }
            });
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchParams.employeeId && ctrl.searchParams.employeeId !== null) {
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
                    ctrl.timesheetList = [];
                    ctrl.rerenderDataTable();
                }
            } else {
                ctrl.timesheetList = [];
                ctrl.criteriaSelected = false;
                ctrl.rerenderDataTable();
            }
            //            ctrl.datatableObj.fnDraw();
        };
        ctrl.retrieveTimesheet = function() {
            $scope.hideDefaultImage = false;
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            if (ctrl.searchParams.employeeId != null && ctrl.searchParams.startDate != null) {
                $location.search({id: ctrl.searchParams.employeeId, from: ctrl.searchParams.startDate, to: ctrl.searchParams.endDate});
            }
            if (ctrl.searchParams.employeeId !== null) {
                ctrl.selectedEmployee = ctrl.employeeIdMap[ctrl.searchParams.employeeId];
            }
            TimesheetDAO.retrieveEmployeeTimeSheet(ctrl.searchParams).then(function(res) {
                ctrl.dataRetrieved = true;
                ctrl.timesheetList = res;
                angular.forEach(ctrl.timesheetList, function(obj) {
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
                //                ctrl.timesheetList = ontimetest.employeeTimesheet;
            }).then(function() {
                if (ctrl.searchParams.employeeId !== null) {
                    $scope.hideDefaultImage = true;
                }
                $rootScope.unmaskLoading();
            });
        };

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll({subAction: 'all'}).then(function(res) {
                ctrl.employeeList = res;
                ctrl.employeeIdMap = {};
                for (var i = 0; i < res.length; i++) {
                    ctrl.employeeIdMap[res[i].id] = res[i];
                }
                var params = $location.search();
                if (params != null && params.id != null) {
                    ctrl.searchParams.employeeId = Number(params.id);
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

//                $('#sboxit-2').select2('destroy');
//                $("#sboxit-2").select2({
//                    placeholder: 'Select your country...',
////                                                        minimumInputLength: 1,
//                }).on('select2-open', function()
//                {
                //                    $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
//                });
                //                $('#sboxit-2').select2();
                //                ctrl.filterTimesheet();
            }).catch(function(data, status) {
                //                ctrl.employeeList = ontimetest.employees;
            });
        }
        ;
        ctrl.openTaskListModal = function(modal_id, modal_size, modal_backdrop, tasks) {
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
                    var length = ctrl.timesheetList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.timesheetList[i].id === punchObj.id) {
                            ctrl.timesheetList.splice(i, 1);
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

        ctrl.openEditModal = function(employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.selectEmployeeModel.baseUrl = ctrl.baseUrl;
            $rootScope.selectEmployeeModel.companyCode = ctrl.companyCode;
            $rootScope.selectEmployeeModel.employee = employee;
            if (employee.languageSpoken != null && employee.languageSpoken.length > 0) {
                $rootScope.selectEmployeeModel.employee.languageSpoken = employee.languageSpoken.split(",");
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "$modal", "$timeout", "$location", "Page", EmployeeTimeSheetCtrl]);
})();