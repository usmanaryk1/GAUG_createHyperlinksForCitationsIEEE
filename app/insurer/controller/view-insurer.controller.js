(function() {
    function ViewInsurersCtrl(InsurerDAO, $rootScope, $stateParams, $state, $modal) {
        var ctrl = this;
        $rootScope.selectEmployeeModel={};
        ctrl.retrieveInsurers = retrieveInsurersData;
        ctrl.edit = edit;
        ctrl.deleteInsurer = deleteInsurer;
        
        function retrieveInsurersData() {
            InsurerDAO.retrieveAll().then(function(res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        if (res) {
                            ctrl.insurerList = res;
                        }
                    }
                }); // showLoadingBar

            }).catch(function(data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function() {
                        
                    }
                }); // showLoadingBar
                ctrl.insurerList = ontimetest.insuranceProviders;
            });
        }
        
        function edit(insurer){
            $state.go('app.insurer', {id: insurer.id});
        }
        
        function deleteInsurer(insurer){
            var length = ctrl.insurerList.length;
            
            for(var i=0;i<length;i++){
                if(ctrl.insurerList[i].id === insurer.id){
                    ctrl.insurerList.splice(i, 1);
                    break;
                }
            }
        }
        
        ctrl.retrieveInsurers();
//        ctrl.openEditModal = function(employee, modal_id, modal_size, modal_backdrop)
//        {
//            $rootScope.selectEmployeeModel = $modal.open({
//                templateUrl: modal_id,
//                size: modal_size,
//                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
//            });
//            $rootScope.selectEmployeeModel.employee=employee;
//
//        };
        
    }
    ;
    angular.module('xenon.controllers').controller('ViewInsurersCtrl', ["InsurerDAO", "$rootScope", "$stateParams", "$state", "$modal", ViewInsurersCtrl]);
})();