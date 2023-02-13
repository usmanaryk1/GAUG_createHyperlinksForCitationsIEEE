(function () {
    var confirmModalController = function ($modalInstance, message, title) {
        var ctrl = this;
        ctrl.message = message;
        ctrl.title = title;
        ctrl.ok = function () {
            $modalInstance.close();
        };
        ctrl.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
    angular.module('xenon.controllers').controller('ConfirmModalController', ['$modalInstance', 'message', 'title', confirmModalController]);
})();