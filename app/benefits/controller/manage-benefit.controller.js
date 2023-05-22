(function () {
    function ManageBenefitCtrl($scope, $rootScope, $state, $modal, $timeout, InsurerDAO, CareTypeDAO, Page) {
        var ctrl = this;
        ctrl.selectedBenefits = [];
        Page.setTitle("Manage Benefits");

        //function called on page initialization.
        function pageInit() {
            ctrl.benefitList = ontime_data.benefitList;
            $timeout(function () {
                $('#multi-select').multiSelect('refresh');
            });
        }
        pageInit();

// Open Simple Modal
        ctrl.openModal = function (modal_id, modal_size, modal_backdrop, selection)
        {

            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('benefits', 'benefit-modal'),
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false,
                controller: 'BenefitModalCtrl as benefitModal',
                resolve: {
                    benefitObj: function () {
                        return ctrl.newSelectedType;
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("popup closed");
            });
        };



        $scope.$watch(function () {
            return ctrl.selectedBenefits;
        }, function (newValue, oldValue) {
            $timeout(function () {
                $("#multi-select").multiSelect('refresh');
            });
            if (ctrl.displayBenefitModal && newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                if (!ctrl.unselecteModalOpen) {
                    if (oldValue == null) {
                        ctrl.newSelectedType = newValue;
                    } else {
                        ctrl.newSelectedType = arr_diff(newValue, oldValue);
                    }
                    ctrl.openModal('modal-5', 'md', 'static', true);
                } else {
                    ctrl.unselecteModalOpen = false;
                }
            } else if (oldValue !== null && newValue.length < oldValue.length) {
                if (!ctrl.selecteModalOpen) {
                    ctrl.newDeselectedType = arr_diff(oldValue, newValue);
                    ctrl.openModal('modal-5', 'md', 'static', false);
                } else {
                    ctrl.selecteModalOpen = false;
                }
            }
        }, true);
    }
    ;
    angular.module('xenon.controllers').controller('ManageBenefitCtrl', ["$scope", "$rootScope", "$state", "$modal", "$timeout", "InsurerDAO", "CareTypeDAO", "Page", ManageBenefitCtrl]);
})();