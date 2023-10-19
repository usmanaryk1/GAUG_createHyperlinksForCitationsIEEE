/* global _, ontime_data */

(function () {
    function ApplicationApproveCtrl($rootScope, application, $modalInstance, $formService, ApplicationDAO, EmployeeDAO, PositionDAO) {
        var ctrl = this;
        ctrl.ssn = {'exists': false};
        ctrl.applicationAdditionalDetail = {"ssn": application.ssn};

        ctrl.close = function () {
            $modalInstance.close();
        };

        ctrl.positionList = [];
        PositionDAO.retrieveAll({}).then(function (res) {
            ctrl.positionList = res;
            if (ctrl.positionList && ctrl.positionList.length > 0) {
                if (!ctrl.applicationAdditionalDetail.companyPositionId || ctrl.applicationAdditionalDetail.companyPositionId === null) {
                    ctrl.applicationAdditionalDetail.companyPositionId = ctrl.positionList[0].id;
                }
            }
            $formService.resetRadios();
        });

        ctrl.approveApplication = function () {
            ctrl.ssn.exists = false;
            if ($('#approve_employee_popup')[0].checkValidity()) {
                $rootScope.maskLoading();
                EmployeeDAO.checkIfSsnExists({ssn: ctrl.applicationAdditionalDetail.ssn})
                        .then(function (res) {
                            if (res.data) {
                                ctrl.ssn.exists = true;
                                $rootScope.unmaskLoading();
                            } else {
                                ctrl.ssn.exists = false;
                                ApplicationDAO.approveApplication({'applicationId': application.applicationId, 'additionalDetails': ctrl.applicationAdditionalDetail})
                                        .then(function (res) {
                                            $modalInstance.close();
                                            toastr.success('Application is approved and employee record is created');
                                        })
                                        .catch(function (res) {
                                            toastr.error('Something went wrong');
                                        }).then(function () {
                                    $rootScope.unmaskLoading();
                                });
                            }
                        })
                        .catch(function () {
                            $rootScope.unmaskLoading();
                        });


            } else {
                ctrl.ssn.exists = false;
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ApplicationApproveCtrl', ["$rootScope", "application", "$modalInstance", "$formService", "ApplicationDAO", "EmployeeDAO", "PositionDAO", ApplicationApproveCtrl]);
})();