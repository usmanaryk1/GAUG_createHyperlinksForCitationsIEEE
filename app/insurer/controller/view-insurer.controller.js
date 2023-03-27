(function() {
    function ViewInsurersCtrl(InsurerDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        ctrl.retrieveInsurers = retrieveInsurersData;
        ctrl.edit = edit;
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;

        function retrieveInsurersData() {
            $rootScope.maskLoading();
            InsurerDAO.retrieveAll().then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        if (res) {
                        }
                    }
                }); // showLoadingBar
                ctrl.insurerList = res;
                if (res.length === 0) {
                    toastr.error("No data in the system.");
                }
            }).catch(function(data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {

                    }
                }); // showLoadingBar
                toastr.error("Failed to retrieve insurance provider.");
//                ctrl.insurerList = ontimetest.insuranceProviders;
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        }

        function edit(insurer) {
            $state.go('app.insurer', {id: insurer.id});
        }

        ctrl.openModal = function(insurer, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.deleteInsurerModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.deleteInsurerModel.insurer = insurer;

            $rootScope.deleteInsurerModel.delete = function(insurer) {
                $rootScope.maskLoading();
                InsurerDAO.delete({id: insurer.id}).then(function(res) {
                    var length = ctrl.insurerList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.insurerList[i].id === insurer.id) {
                            ctrl.insurerList.splice(i, 1);
                            break;
                        }
                    }
                    $rootScope.deleteInsurerModel.close();
                }).catch(function(data, status) {

                    var length = ctrl.insurerList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.insurerList[i].id === insurer.id) {
                            ctrl.insurerList.splice(i, 1);
                            break;
                        }
                    }
                    $rootScope.deleteInsurerModel.close();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            };

        };
        ctrl.openEditModal = function(insurer, modal_id, modal_size, modal_backdrop)
        {
            $rootScope.selectInsurerModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.selectInsurerModel.planTypeMap = {"mcd": "Medicaid", "mcr": "Medicare", "tc": "Tricare Champus", "cva": "ChampVA", "gh": "Group Healthplan", "fbl": "Feca Black Lung", "bc": "Blue Cross", "bs": "Blue Shield", "bcb": "Blue Cross/Blue Sheild (BCBS)", "oth": "Other"};
            $rootScope.selectInsurerModel.insurer = insurer;

        };
        ctrl.retrieveInsurers();
    }
    ;
    angular.module('xenon.controllers').controller('ViewInsurersCtrl', ["InsurerDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewInsurersCtrl]);
})();