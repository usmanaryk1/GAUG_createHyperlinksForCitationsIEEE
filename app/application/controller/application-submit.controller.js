/* global _, ontime_data */

(function () {
    function ApplicationSubmitCtrl($rootScope, application, $modalInstance, ApplicationPublicDAO) {
        var ctrl = this;

        ctrl.close = function () {
            $modalInstance.close();
        };
        
        if (application.signature != null) {
            ctrl.dataUrl = "data:image/png;base64," + application.signature;
        }

        ctrl.submitApplication = function () {
            var data = {};
            if (ctrl.dataUrl !== null) {
                data.signature = ctrl.dataUrl.substring(ctrl.dataUrl.indexOf(",") + 1);
            }
            
            ApplicationPublicDAO.submitApplication({'applicationId': application.applicationId, data: data})
                    .then(function (res) {
                        $modalInstance.close('submitted');
                        toastr.success('Application is sumitted for review');
                    })
                    .catch(function (res) {
                        toastr.error('Something went wrong');
                    }).then(function () {
                $rootScope.unmaskLoading();
            });
        };
    }
    ;
    angular.module('xenon.controllers').controller('ApplicationSubmitCtrl', ["$rootScope", "application", "$modalInstance", "ApplicationPublicDAO", ApplicationSubmitCtrl]);
})();