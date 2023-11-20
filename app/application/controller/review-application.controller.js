/* global _, ontime_data */

(function () {
    function ReviewApplicationCtrl($rootScope, application, $modalInstance, $formService, ApplicationDAO, EmployeeDAO, PositionDAO) {
        var ctrl = this;
        ctrl.status = 'nmi';
        ctrl.content_not_filled = false;
        ctrl.editorOptions = {
            language: 'ru',
            uiColor: '#000000'
        };


        ctrl.close = function () {
            $modalInstance.close();
        };

        ctrl.reviewApplication = function () {
            if (ctrl.status === 'nmi') {
                if (ctrl.emailContent !== null && ctrl.emailContent !== '') {
                    ctrl.content_not_filled = false;
                    $rootScope.maskLoading();
                    var nmiDetails = {'content': ctrl.emailContent, appPath: window.location.toString()}
                    ApplicationDAO.needMoreInfoApplication({'applicationId': application.applicationId, 'nmiDetails': nmiDetails})
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
            }
        }

    }
    ;
    angular.module('xenon.controllers').controller('ReviewApplicationCtrl', ["$rootScope", "application", "$modalInstance", "$formService", "ApplicationDAO", "EmployeeDAO", "PositionDAO", ReviewApplicationCtrl]);
})();