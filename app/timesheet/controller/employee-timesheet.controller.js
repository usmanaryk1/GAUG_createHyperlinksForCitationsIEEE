(function() {
    function EmployeeTimeSheetCtrl($scope, $rootScope, TimesheetDAO, EmployeeDAO, $modal, $timeout, $location) {
        var ctrl = this;
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.datatableObj = {};
        ctrl.viewRecords = 10;
        ctrl.searchParams = {};
        ctrl.employeeIdMap = {};
        ctrl.employeeList = [];
//        var params = $location.search();
//        if (params != null && params.id != null) {
//            ctrl.searchParams.employeeId = params.id;
//        }
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            $('#sboxit-2').select2('val', null);
            ctrl.selectedEmployee = null;
            ctrl.timesheetList = [];
            ctrl.rerenderDataTable();
        };
        ctrl.rerenderDataTable = function() {
            ctrl.datatableObj = {};
            var timesheetList = angular.copy(ctrl.timesheetList);
            ctrl.timesheetList = [];
            $("#example-1_wrapper").remove();
            $timeout(function() {
                ctrl.timesheetList = timesheetList;
            });
        };
        ctrl.filterTimesheet = function() {
            if (ctrl.searchParams.employeeId && ctrl.searchParams.employeeId !== null) {
                if (ctrl.searchParams.startDate == "") {
                    ctrl.searchParams.startDate = null;
                }
                if (ctrl.searchParams.endDate == "") {
                    ctrl.searchParams.endDate = null;
                }
                ctrl.retrieveTimesheet();
            } else {
                ctrl.timesheetList = [];
                ctrl.rerenderDataTable();
            }
            //            ctrl.datatableObj.fnDraw();
        };
        ctrl.retrieveTimesheet = function() {
            $scope.hideDefaultImage = false;
            if (ctrl.searchParams.employeeId !== null) {
                ctrl.selectedEmployee = ctrl.employeeIdMap[ctrl.searchParams.employeeId];
                if (ctrl.selectedEmployee.profileImage == null || ctrl.selectedEmployee.profileImage == '') {
                    $scope.hideDefaultImage = true;
                }
            }
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            TimesheetDAO.retrieveEmployeeTimeSheet(ctrl.searchParams).then(function(res) {
                ctrl.dataRetrieved = true;
                ctrl.timesheetList = res;
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
                $rootScope.unmaskLoading();
            });
        };

        retrieveEmployeesData();
        function retrieveEmployeesData() {
            EmployeeDAO.retrieveAll({subAction: 'active'}).then(function(res) {
                ctrl.employeeList = res;
                ctrl.employeeIdMap = {};
                for (var i = 0; i < res.length; i++) {
                    ctrl.employeeIdMap[res[i].id] = res[i];
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
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            //            $rootScope.taskListModal.taskList = [{label: "Slicing", value: false}, {label: "WooCommerce", value: true}, {label: "Programming", value: false}, {label: "SEO Optimize", value: true}];
            $rootScope.taskListModal.taskList = tasks;

        };


        ctrl.openDeleteModal = function(punchObj, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deletePunchModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
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
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectEmployeeModel.baseUrl = ctrl.baseUrl;
            $rootScope.selectEmployeeModel.companyCode = ctrl.companyCode;
            $rootScope.selectEmployeeModel.employee = employee;

        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "EmployeeDAO", "$modal", "$timeout", "$location", EmployeeTimeSheetCtrl]);
})();