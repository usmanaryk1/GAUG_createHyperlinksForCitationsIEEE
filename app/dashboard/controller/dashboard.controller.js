(function () {
    function DashboardCtrl(Page, $rootScope, $modal, $timeout) {
        var ctrl = this;
        Page.setTitle("Dashboard");
        $rootScope.isAdminPortal = false;
        $rootScope.openResetPasswordModal = function (modal_id, modal_size, modal_backdrop)
        {
            $rootScope.resetPasswordModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.resetPasswordModal.save = function () {
                $timeout(function () {
                    if ($rootScope.resetPasswordModal.password != $rootScope.resetPasswordModal.confirmPassword) {
                        $rootScope.resetPasswordModal.passwordNotMatch = true;
                    } else {
                        $rootScope.resetPasswordModal.passwordNotMatch = false;
                    }

                    if ($("#reset_password_form")[0].checkValidity() && !$rootScope.resetPasswordModal.passwordNotMatch) {
//                $rootScope.maskLoading();
//                InsurerDAO.delete({id: insurer.id}).then(function (res) {
//                    toastr.success("Insurer deleted.");
//                    $rootScope.resetPasswordModal.close();
//                }).catch(function (data, status) {
//                    toastr.error(data.data);
//                    $rootScope.resetPasswordModal.close();
//                }).then(function () {
//                    $rootScope.unmaskLoading();
//                });
                    }
                });
            };
        };
        var isFirstTime = false;
        if (isFirstTime) {
            $rootScope.openResetPasswordModal("resetPasswordModal", 'md');
        }
    }
    ;
    angular.module('xenon.controllers').controller('DashboardCtrl', ["Page", "$rootScope", "$modal", "$timeout", DashboardCtrl]);
})();
