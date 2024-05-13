(function () {
    function ViewCareTypesCtrl(CareTypeDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, $timeout, $formService, PositionDAO) {
        var ctrl = this;
        
        function initialize(){
            //$rootScope.maskLoading();
            Page.setTitle("Care Types");
            ctrl.companyCode = ontime_data.company_code;
            ctrl.baseUrl = ontime_data.weburl;

            ctrl.careTypeList = [];
            ctrl.positions = [];
            ctrl.test ='';
            
            ctrl.retrieveCareTypes = retrieveCareTypes;
            ctrl.addEditPopup = addEditPopup;
            ctrl.getPositions = getPositions;
            ctrl.save = save;
            ctrl.activateDeactivatePopup = activateDeactivatePopup;
            ctrl.activateDeactivateCareType = activateDeactivateCareType;
            ctrl.retrieveCareTypes();
        }

        function getPositions() {
            PositionDAO.view({subAction: 'active'}).then(function (res) {
                $rootScope.careTypeModel.positions = res;
            });
        };

        function retrieveCareTypes(){
            CareTypeDAO.view({subAction: 'all'}).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.careTypeList = res;
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve caretypes.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
                console.log('Error in retrieving data')
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        }

        function addEditPopup(caretype){
            var caretypeCopy = angular.copy(caretype);
            $rootScope.careTypeModel = $modal.open({
                templateUrl: 'careTypeModel'
            });

            if(caretypeCopy == undefined) { 
                $rootScope.careTypeModel.caretype = {};
                $rootScope.careTypeModel.caretype.action = 'savecaretype';
            }else{
                $rootScope.careTypeModel.caretype = caretypeCopy;
                $rootScope.careTypeModel.caretype.action = 'updatecaretype';
            }

            ctrl.getPositions();
            
            
            $rootScope.careTypeModel.closePopup = function(){
                $rootScope.careTypeModel.close();
            }

            $rootScope.careTypeModel.save = function(){
                if($rootScope.careTypeModel.caretype_form.$valid){
                    ctrl.save($rootScope.careTypeModel.caretype);   
                }                
            }
        }

        function save(caretype){
            //position.positionGroup = position.positionGroup.join(',');
            CareTypeDAO.update(caretype).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.success("Company Care Type saved.");
                $rootScope.careTypeModel.close(); 
                ctrl.retrieveCareTypes();
                //Reset dirty status of form
                if ($.fn.dirtyForms) {
                    $('form').dirtyForms('setClean');
                    $('.dirty').removeClass('dirty');
                }
            }).catch(function (data, status) {
                toastr.error(data.data);
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                }); // showLoadingBar
                console.log('Error in retrieving data')
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        }

        function activateDeactivatePopup(caretype, modal_id, action, modal_size, modal_backdrop)
        {
            $rootScope.careTypeActivateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            
            $rootScope.careTypeActivateModal.action = action;
            $rootScope.careTypeActivateModal.caretype = caretype;
            
            $rootScope.careTypeActivateModal.confirm = function (caretype) {
                ctrl.activateDeactivateCareType(caretype, action);
            };

            $rootScope.careTypeActivateModal.dismiss = function(){
                $rootScope.careTypeActivateModal.close();
            }

        }

        function activateDeactivateCareType(caretype, action){
            CareTypeDAO.changestatus({id: caretype.id, status: action}).then(function (res) {
                toastr.success("Care Type " + action + "d.");
                ctrl.retrieveCareTypes();
            }).catch(function (data, status) {
                toastr.error("Care Type cannot be " +  action  + "d.");
            }).then(function () {
                $rootScope.careTypeActivateModal.close();
                $rootScope.unmaskLoading();
            });
        }


        initialize();
    };

    angular.module('xenon.controllers').controller('ViewCareTypesCtrl', ["CareTypeDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "$timeout", "$formService", "PositionDAO", ViewCareTypesCtrl]);
})();