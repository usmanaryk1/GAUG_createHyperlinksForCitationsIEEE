(function () {
    function ViewPositionsCtrl(PositionDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, $timeout, $formService) {
        var ctrl = this;
        
        function initialize(){
            $rootScope.maskLoading();
            Page.setTitle("Positions");
            ctrl.companyCode = ontime_data.company_code;
            ctrl.baseUrl = ontime_data.weburl;

            ctrl.positionList = [];
            
            ctrl.retrievePositions = retrievePositionsData;
            ctrl.addEditPopup = addEditPopup;
            ctrl.save = save;
            //ctrl.changeStatus = changeStatus;
            ctrl.retrievePositions();
        }

        function initMultiSelect(){
            setTimeout(function () {
                $("#multi-select").multiSelect({
                    afterInit: function()
                    {
                        // Add alternative scrollbar to list
                        this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar();
                    },
                    afterSelect: function()
                    {
                        // Update scrollbar size
                        this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar('update');
                    }
                });
            }, 100);
        }


        function retrievePositionsData(){

            PositionDAO.retrieveAll().then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.positionList = res;
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve users.");
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

        function displayPositionGroup(positionGroup){
            if(position.positionGroup == undefined){
               $rootScope.positionModel.position.positionGroup = [];
            }else{
                $rootScope.positionModel.position.positionGroup = position.positionGroup.split(",");
            }
        }

        function addEditPopup(position) {
            var positionCopy = angular.copy(position);
            $rootScope.positionModel = $modal.open({
                templateUrl: 'positionModel'
            });

            if(positionCopy == undefined) { 
                $rootScope.positionModel.position = {};
                $rootScope.positionModel.position.action = 'saveposition';
                $rootScope.positionModel.position.colorCode = '#000000';
            }else{
                $rootScope.positionModel.position = positionCopy;
                $rootScope.positionModel.position.action = 'updateposition';
                if(positionCopy.positionGroup == undefined){
                    $rootScope.positionModel.position.positionGroup = [];
                }else{
                    $rootScope.positionModel.position.positionGroup = positionCopy.positionGroup.split(",");
                }
            }
            
            $rootScope.positionModel.closePopup = function(){
                $rootScope.positionModel.close();
            }

            $rootScope.positionModel.save = function(){
                if($rootScope.positionModel.position_form.$valid){
                    ctrl.save($rootScope.positionModel.position);
                    $rootScope.positionModel.close();    
                }                
            }
            initMultiSelect();
        }

        function save(position){
            //position.positionGroup = position.positionGroup.join(',');
            PositionDAO.update(position).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.success("Company Position saved.");
                ctrl.retrievePositions();
                //Reset dirty status of form
                if ($.fn.dirtyForms) {
                    $('form').dirtyForms('setClean');
                    $('.dirty').removeClass('dirty');
                }
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve users.");
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

        function activateDeactivatePopup(position, modal_id, action, modal_size, modal_backdrop)
        {
            $rootScope.positionActivateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            
            $rootScope.positionActivateModal.action = action;
            $rootScope.positionActivateModal.position = position;
            
            $rootScope.positionActivateModal.confirm = function (user) {
                if (action == 'activate') {
                    ctrl.activateUser(user);
                } else {
                    ctrl.deactivateUser(user);
                }
            };

        }

        initialize();
    };

    angular.module('xenon.controllers').controller('ViewPositionsCtrl', ["PositionDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "$timeout", "$formService", ViewPositionsCtrl]);
})();