(function () {
    function ViewDispatchCtrl(DispatchDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, PositionDAO) {
        console.log("ViewDispatchCtrl");
        var ctrl = this;
        $rootScope.maskLoading();
        ctrl.datatableObj = {};
        Page.setTitle("View Dispatch");
        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;

        ctrl.searchParams = {limit: 10, pageNo: 1, sortBy: 'dispatchCreatedOn', order: 'desc', status: "active"};
        ctrl.dispatchList = [];

        ctrl.viewType = 'active';
        ctrl.retrieveDispatchList = retrieveDispatchListData;

        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.retrieveDispatchList();
        };

        ctrl.applySearch = function () {
            ctrl.searchParams.pageNo = 1;
            $debounce(retrieveDispatchListData, 500);
        };

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
            ctrl.retrieveDispatchList();
        };

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

        function retrieveDispatchListData() {
            $rootScope.paginationLoading = true;
//            ctrl.searchParams.subAction = ctrl.viewType;
            DispatchDAO.retrieveAll(ctrl.searchParams).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.dispatchList = res;
                if (res.length === 0) {
//                    $("#paginationButtons").remove();
//                    toastr.error("No data in the system.");
                }
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve employees.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
//                ctrl.dispatchList = ontime_data.employees;
                console.log('Error in retrieving data')
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });
        }

        ctrl.retrieveDispatchList();

        ctrl.rerenderDataTable = function () {
            if (ctrl.dispatchList.length === 0) {
                if (ctrl.searchParams.pageNo > 1) {
                    ctrl.pageChanged(ctrl.searchParams.pageNo - 1);
                }
//                ctrl.retrieveDispatchList();
            } else {
                ctrl.retrieveDispatchList();
            }
        };

        ctrl.getLanguagesFromCode = function (languageCodes) {
            if (languageCodes != null && languageCodes.length > 0) {
                languageCodes = languageCodes.split(",");
                var languageToDisplay = "";
                angular.forEach(languageCodes, function (code, index) {
                    languageToDisplay += $rootScope.languages[code];
                    if (index < languageCodes.length - 1) {
                        languageToDisplay += ", ";
                    }
                });
                return languageToDisplay;
            } else {
                return "N/A";
            }
        };

        ctrl.openDeactivateModal = function (employee) {
            if ($('#popup_dea_employees')[0].checkValidity()) {
                $rootScope.maskLoading();
                 EmployeeDAO.changestatus({id: employee.id, status: 'inactive', reason: $rootScope.deactivateEmployeeModel.reason, terminationDate:$rootScope.deactivateEmployeeModel.terminationDate}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            if (ctrl.viewType !== 'all') {
                                ctrl.employeeList.splice(i, 1);
                            } else {
                                ctrl.employeeList[i].status = 'i';
                            }
                            break;
                        }
                    }
                    ctrl.rerenderDataTable();
                    toastr.success("Employee deactivated.");
                    $rootScope.deactivateEmployeeModel.close();
                }
                ).catch(function (data, status) {
                    toastr.error("Employee cannot be deactivated.");
                    $rootScope.deactivateEmployeeModel.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });

            }

        };
        
        ctrl.openDeleteModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deleteEmployeeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deleteEmployeeModel.employee = employee;

            $rootScope.deleteEmployeeModel.delete = function (employee) {
                $rootScope.maskLoading();
                EmployeeDAO.delete({id: employee.id}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    ctrl.rerenderDataTable();
                    toastr.success("Employee deleted.");
                    $rootScope.deleteEmployeeModel.close();
                }).catch(function (data, status) {
                    toastr.error(data.data);
                    $rootScope.deleteEmployeeModel.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };

        };

    }
    ;
    angular.module('xenon.controllers').controller('ViewDispatchCtrl', ["DispatchDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "PositionDAO", ViewDispatchCtrl]);
})();
