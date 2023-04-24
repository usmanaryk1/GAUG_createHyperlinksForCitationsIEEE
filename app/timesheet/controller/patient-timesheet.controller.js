(function() {
    function PatientTimeSheetCtrl($scope, $rootScope, TimesheetDAO, PatientDAO, $modal, $timeout) {
        var ctrl = this;
        ctrl.datatableObj = {};
        ctrl.searchParams = {};
        ctrl.viewRecords = 10;
        ctrl.changeViewRecords = function() {
            ctrl.datatableObj.fnSettings()._iDisplayLength = ctrl.viewRecords;
            ctrl.datatableObj.fnDraw();
        };
        ctrl.resetFilters = function() {
            ctrl.searchParams.startDate = null;
            ctrl.searchParams.endDate = null;
            ctrl.selectPatient(ctrl.patientList[0]);
            ctrl.filterTimesheet();
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
            if (ctrl.searchParams.startDate == "") {
                ctrl.searchParams.startDate = null;
            }
            if (ctrl.searchParams.endDate == "") {
                ctrl.searchParams.endDate = null;
            }
//            ctrl.datatableObj.fnDraw();
            ctrl.retrieveTimesheet();
        };
//        $.fn.dataTable.ext.search.push(
//                function(settings, data, dataIndex) {
//                    if (ctrl.searchValue != null) {
//                        var dataToCompare = data.toString().toLowerCase();
//                        if (dataToCompare.indexOf(ctrl.searchValue.toLowerCase()) < 0) {
//                            return false;
//                        }
//                    }
//                    if (ctrl.searchParams.startDate == null && ctrl.searchParams.endDate == null) {
//                        return true;
//                    }
//                    var date = new Date(data[0]);
//                    if (ctrl.searchParams.startDate != null) {
//                        if (date.getTime() < new Date(ctrl.searchParams.startDate).getTime()) {
//                            return false;
//                        }
//                    }
//                    if (ctrl.searchParams.endDate != null) {
//                        if (date.getTime() > new Date(ctrl.searchParams.endDate).getTime()) {
//                            return false;
//                        }
//                    }
//                    return true;
//                }
//        );
        ctrl.retrieveTimesheet = function() {
            $rootScope.maskLoading();
            ctrl.dataRetrieved = false;
            TimesheetDAO.retrievePatientTimeSheet(ctrl.searchParams).then(function(res) {
                ctrl.dataRetrieved = true;
//                showLoadingBar({
//                    delay: .5,
//                    pct: 100,
//                    finish: function() {
//                        if (res) {
//                            
//                        }
//                    }
//                }); // showLoadingBar
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

        ctrl.selectPatient = function(patObj) {
            ctrl.selectedPatient = patObj;
            ctrl.pat = patObj;
            ctrl.searchParams.patientId = patObj.id;
        };

        retrievePatientsData();
        function retrievePatientsData() {
            PatientDAO.retrieveAll({status: 'active'}).then(function(res) {
                ctrl.patientList = res;
                ctrl.selectPatient(ctrl.patientList[0]);
                ctrl.filterTimesheet();
            }).catch(function(data, status) {
                ctrl.patientList = ontimetest.patients;
                ctrl.selectPatient(ctrl.patientList[0]);
            });
        }
        ;

        ctrl.openTaskListModal = function(modal_id, modal_size, modal_backdrop, tasks)
        {
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
    }
    ;
    angular.module('xenon.controllers').controller('PatientTimeSheetCtrl', ["$scope", "$rootScope", "TimesheetDAO", "PatientDAO", "$modal", "$timeout", PatientTimeSheetCtrl]);
})();