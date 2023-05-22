/* global ontime_data */

(function () {
    function ManageBenefitCtrl($scope, $rootScope, $state, $modal, $timeout, BenefitDAO, Page) {
        var ctrl = this;
        ctrl.selectedBenefits = [];
        ctrl.benifitObj = {};
        ctrl.benifitObj.benefitPackageLineSet = [];
        
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontime_data.defaultState);
            }
            Page.setTitle("Update Benefit");
        } else {
            Page.setTitle("Add Benefit");
        }        

        //function called on page initialization.
        function pageInit() {
            ctrl.benefitList = ontime_data.benefitList;
            if ($state.params.id && $state.params.id !== '') {
                BenefitDAO.get({id: $state.params.id}).then(function (res) {
                    ctrl.benifitObj = res;
                    console.log("ctrl.benifitObj----", ctrl.benifitObj);
                    if (ctrl.benifitObj.benefitPackageLineSet == null) {
                        ctrl.benifitObj.benefitPackageLineSet = [];
                    } else {                        
                        angular.forEach(ctrl.benifitObj.benefitPackageLineSet, function (obj) {
                            if (ctrl.benefitList.indexOf(obj.lineType)) {
                                avoidWatch = true;
                                ctrl.selectedBenefits.push(obj.lineType);
                            }
                        });
                    }
                }).catch(function (data, status) {
                    toastr.error("Failed to retrieve insurance provider.");
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function () {

                        }
                    }); // showLoadingBar
                    console.log(JSON.stringify(ctrl.benifitObj));
                }).then(function () {
                    $rootScope.unmaskLoading();
                    $timeout(function () {
                        $('#multi-select').multiSelect('refresh');
                    });
                });
            }            
        }
        pageInit();

        var avoidWatch = true;

        // Open Simple Modal
        ctrl.openModal = function (modal_id, modal_size, modal_backdrop, editMode) {

            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('benefits', 'benefit-modal'),
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false,
                controller: 'BenefitModalCtrl as benefitModal',
                resolve: {
                    selectedType: function () {
                        return ctrl.newSelectedType;
                    },
                    benefitPackageLineSet: function () {
                        return angular.copy(ctrl.benifitObj.benefitPackageLineSet);
                    },
                    editMode: function () {
                        return editMode;
                    }
                }
            });
            modalInstance.result.then(function (result) {
                console.log("result.reverse", result.reverse, "result.benefitPackageLineSet", result.benefitPackageLineSet);
                if (result.reverse) {
                    avoidWatch = true;
                    if (!editMode)
                        ctrl.selectedBenefits.splice(ctrl.selectedBenefits.indexOf(ctrl.newSelectedType.toString()), 1);
                    else
                        ctrl.selectedBenefits.push(ctrl.newSelectedType.toString());
                }
                if (result.benefitPackageLineSet) {
                    ctrl.benifitObj.benefitPackageLineSet = angular.copy(result.benefitPackageLineSet);
                }
                console.log("popup closed", ctrl.benifitObj, result.benefitPackageLineSet);
            });
        };



        $scope.$watch(function () {
            return ctrl.selectedBenefits;
        }, function (newValue, oldValue) {
            console.log("newValue", newValue, "oldValue", oldValue, "avoidWatch", avoidWatch);
            if (avoidWatch === false) {
                $timeout(function () {
                    $("#multi-select").multiSelect('refresh');
                });
                if (newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                    if (oldValue == null) {
                        ctrl.newSelectedType = newValue;
                    } else {
                        ctrl.newSelectedType = arr_diff(newValue, oldValue);
                    }
                    ctrl.openModal('modal-5', 'md', 'static', false);
                } else if (oldValue !== null && newValue.length < oldValue.length) {
                    ctrl.newSelectedType = arr_diff(oldValue, newValue);
                    ctrl.openModal('modal-5', 'md', 'static', true);
                }
            } else {
                avoidWatch = false;
                $timeout(function () {
                    $("#multi-select").multiSelect('refresh');
                });
            }
        }, true);
        
        ctrl.saveBenifits = function(){
            if ($('#add_benifit_form')[0].checkValidity()) {
                console.log("ctrl.benifitObj", ctrl.benifitObj);
                var benifitObjToSave = angular.copy(ctrl.benifitObj);
                console.log('Benifit Package Object : ' + JSON.stringify(benifitObjToSave));
                $rootScope.maskLoading();
                if($state.params.id && $state.params.id !== ''){
                    BenefitDAO.save(benifitObjToSave).then(function () {
                        toastr.success("Benifit Package Information saved.");
                        $state.go('admin.benefits');
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }else{
                    BenefitDAO.update(benifitObjToSave).then(function () {
                        toastr.success("Benifit Package Information updated.");
                        $state.go('admin.benefits');
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }

            }          
        };
    }
    ;
    angular.module('xenon.controllers').controller('ManageBenefitCtrl', ["$scope", "$rootScope", "$state", "$modal", "$timeout", "BenefitDAO", "Page", ManageBenefitCtrl]);
})();