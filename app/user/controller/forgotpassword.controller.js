(function () {
    function ForgotPasswordCtrl($scope, UserDAO, $rootScope, $state) {
        var ctrl = this;
        ctrl.submitHandler = function () {
            if ($('#forgotPassword').valid()) {
                setCookie("cc", ctrl.companyCode, 7);
                $rootScope.maskLoading();
                UserDAO.resetUserPassword({userName: ctrl.username}).then(function (res) {
                    toastr.success("Password reset successfully.");
                    $state.transitionTo(ontimetest.defaultState);
                }).catch(function (data, status) {
                    toastr.error(data.data);
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };
    }
    ;
    angular.module('xenon.controllers').controller('ForgotPasswordCtrl', ["$scope", "UserDAO", "$rootScope", "$state", ForgotPasswordCtrl]);
})();
