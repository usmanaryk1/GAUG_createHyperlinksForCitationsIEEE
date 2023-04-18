(function () {
    function PasswordModalCtrl($modalInstance) {
        var ctrl = this;
        ctrl.companyCode = ontime_data.company_code;
        ctrl.save = function () {
            if ($('#popuppassword')[0].checkValidity()) {
                if (ctrl.password != ontime_data.pastEventAuthorizationPassword) {
                    toastr.error('Authorization Failed');
                    $modalInstance.dismiss();
                } else {
                    $modalInstance.close({password: 'correct'});
                }
            }
        };
        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('PasswordModalCtrl', ["$modalInstance", PasswordModalCtrl]);
})();