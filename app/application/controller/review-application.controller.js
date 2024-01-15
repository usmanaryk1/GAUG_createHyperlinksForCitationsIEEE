/* global _, ontime_data */

(function () {
    function ReviewApplicationCtrl($rootScope, application, action, $modalInstance, $formService, ApplicationDAO, EmployeeDAO, PositionDAO) {
        var ctrl = this;
        ctrl.showStatus = true;

        if (action && action === 'rfo') {
            ctrl.status = 'rfo';
            ctrl.showStatus = false;
        } else if (action && action === 'rejected') {
            ctrl.status = 'rejected';
            ctrl.showStatus = false;
        } else {
            ctrl.status = 'nmi';
        }
        ctrl.content_not_filled = false;
        ctrl.editorOptions = {
            language: 'ru',
            uiColor: '#000000'
        };

        ctrl.currentDate = new Date();
        ctrl.maxBirthDate = new Date().setYear((ctrl.currentDate.getYear() + 1900) - 10);

        ctrl.dateOfBirth = application.dateOfBirth;
        ctrl.email = application.email;
        ctrl.close = function () {
            $modalInstance.close();
        };

        ctrl.position = "";
        PositionDAO.retrieveAll({}).then(function (res) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].id === application.positionId) {
                    ctrl.position = res[i].position;
                    break;
                }
            }
        });

        ctrl.reviewApplication = function () {
            if (ctrl.status === 'nmi' || ctrl.status === 'rejected') {
                if (ctrl.emailContent !== null && ctrl.emailContent !== '') {
                    ctrl.content_not_filled = false;
                    $rootScope.maskLoading();
                    var nmiDetails = {'content': ctrl.emailContent, appPath: window.location.toString()}
                    ApplicationDAO.reviewApplication({'applicationId': application.applicationId, 'nmiDetails': nmiDetails,
                    'reviewAction': ctrl.status === 'nmi'? 'request-more-info': 'reject'})
                            .then(function (res) {
                                $modalInstance.close();
                                toastr.success('Application is moved to Need More Info and email sent');
                            })
                            .catch(function (res) {
                                toastr.error('Something went wrong');
                            }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                } else {
                    ctrl.content_not_filled = true;
                }
            } else {
                if ($('#review_employee_popup')[0].checkValidity()) {
                    $rootScope.maskLoading();
                    var rfoDetails = {'email': ctrl.email, 'dateOfBirth': ctrl.dateOfBirth};
                    console.log(JSON.stringify(rfoDetails));
                    ApplicationDAO.readyForOrientationApplication({'applicationId': application.applicationId, 'rfoDetails': rfoDetails})
                            .then(function (res) {
                                $modalInstance.close();
                                toastr.success('Application is moved to Ready for Orientation');
                            })
                            .catch(function (res) {
                                toastr.error('Something went wrong');
                            }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }

            }
        }

    }
    ;
    angular.module('xenon.controllers').controller('ReviewApplicationCtrl', ["$rootScope", "application", "action", "$modalInstance", "$formService", "ApplicationDAO", "EmployeeDAO", "PositionDAO", ReviewApplicationCtrl]);
})();