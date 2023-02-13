(function () {
    function DispatchResponseCtrl(responseId, $rootScope, $modalInstance, DispatchDAO) {
        var ctrl = this;

        ctrl.save = function () {
            ctrl.DispatchResponseForm.$submitted = true;
            if (ctrl.DispatchResponseForm.$valid) {
                $rootScope.maskLoading();
                DispatchDAO.saveResponse({id: responseId},{responseStatus: ctrl.responseStatus, responseMessage: ctrl.responseMessage}).then(function (res) {
                    toastr.success("Response saved successfully.");
                    ctrl.close();
                }).catch(function (data, status) {
                    toastr.error("Response not saved.");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('DispatchResponseCtrl', ["responseId", "$rootScope", "$modalInstance", "DispatchDAO", DispatchResponseCtrl]);
})();