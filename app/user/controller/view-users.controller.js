(function () {
    function ViewUsersCtrl(UserDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, PositionDAO) {
        var ctrl = this;
        $rootScope.maskLoading();
        ctrl.datatableObj = {};
        $rootScope.selectUserModel = {};
        Page.setTitle("View Users");
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        $rootScope.positions = {};
        PositionDAO.retrieveAll({}).then(function (res) {
            if (res && res.length > 0) {
                angular.forEach(res, function (position) {
                    $rootScope.positions[position.id] = position.position;
                });
            }
        });
        ctrl.searchParams = {limit: 10, pageNo: 1, name: ''};
        ctrl.employeeList = [];

        if ($stateParams.status !== 'active' && $stateParams.status !== 'inactive' && $stateParams.status !== 'all') {
            $state.transitionTo(ontimetest.defaultState);
        } else {
            ctrl.viewType = $stateParams.status;
        }
        ctrl.retrieveUsers = retrieveUsersData;
        ctrl.edit = edit;

        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.retrieveUsers();
        };

        ctrl.applySearch = function () {
            ctrl.searchParams.pageNo = 1;
            $debounce(retrieveUsersData, 500);
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
            ctrl.retrieveUsers();
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

        function retrieveUsersData() {
            $rootScope.paginationLoading = true;
            ctrl.searchParams.subAction = ctrl.viewType;
            UserDAO.retrieveAll(ctrl.searchParams).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.employeeList = res;
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
//                ctrl.employeeList = ontimetest.employees;
                console.log('Error in retrieving data')
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });
        }

        function edit(employee) {
            $state.go('app.employee.tab1', {id: employee.id});
        }

        ctrl.retrieveUsers();
        ctrl.openEditModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectUserModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.selectUserModel.baseUrl = ctrl.baseUrl;
            $rootScope.selectUserModel.companyCode = ctrl.companyCode;
            $rootScope.selectUserModel.employee = angular.copy(employee);
            if (employee.languageSpoken != null && employee.languageSpoken.length > 0) {
                $rootScope.selectUserModel.employee.languageSpoken = employee.languageSpoken.split(",");
            }

        };

        ctrl.openDeleteModal = function (employee, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deleteUserModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deleteUserModel.employee = employee;

            $rootScope.deleteUserModel.delete = function (employee) {
                $rootScope.maskLoading();
                UserDAO.delete({id: employee.id}).then(function (res) {
                    var length = ctrl.employeeList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.employeeList[i].id === employee.id) {
                            ctrl.employeeList.splice(i, 1);
                            break;
                        }
                    }
                    ctrl.rerenderDataTable();
                    toastr.success("User deleted.");
                    $rootScope.deleteUserModel.close();
                }).catch(function (data, status) {
                    toastr.error(data.data);
                    $rootScope.deleteUserModel.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };

        };
        ctrl.rerenderDataTable = function () {
            if (ctrl.employeeList.length === 0) {
                if (ctrl.searchParams.pageNo > 1) {
                    ctrl.pageChanged(ctrl.searchParams.pageNo - 1);
                }
//                ctrl.retrieveUsers();
            } else {
                ctrl.retrieveUsers();
            }
        };

        ctrl.deactivateUser = function (employee,status)
        {
            $rootScope.maskLoading();
            UserDAO.changestatus({id: employee.id, status: 'inactive'}).then(function (res) {
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
                toastr.success("User deactivated.");                
            }
            ).catch(function (data, status) {
                toastr.error("User cannot be deactivated.");                
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        };
        
        ctrl.activateUser = function (employee) {
            $rootScope.maskLoading();
            UserDAO.changestatus({id: employee.id, status: 'active'}).then(function (res) {
                var length = ctrl.employeeList.length;

                for (var i = 0; i < length; i++) {
                    if (ctrl.employeeList[i].id === employee.id) {
                        if (ctrl.viewType !== 'all') {
                            ctrl.employeeList.splice(i, 1);
                        } else {
                            ctrl.employeeList[i].status = 'a';
                        }
                        break;
                    }
                }
                ctrl.rerenderDataTable();
                toastr.success("User activated.");               
            }).catch(function (data, status) {
                toastr.error("User cannot be activated.");                
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        }
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

        ctrl.navigateToCalendar = function (employee) {
            $state.go('app.employee-calendar', {id: employee.id});
        };
//        
//        $scope.$watch(function() {
//            return ctrl.viewType;
//        }, function(newVal, oldValue) {
//            ctrl.employeeList = [];
//            ctrl.retrieveUsers();
        //        });
    }
    ;
    angular.module('xenon.controllers').controller('ViewUsersCtrl', ["UserDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "PositionDAO", ViewUsersCtrl]);
})();