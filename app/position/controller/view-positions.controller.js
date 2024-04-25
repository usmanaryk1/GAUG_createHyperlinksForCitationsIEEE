(function () {
    function ViewPositionsCtrl(PositionDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, $timeout, $formService) {
        var ctrl = this;
        $rootScope.maskLoading();
        ctrl.datatableObj = {};
        $rootScope.selectUserModel = {};
        Page.setTitle("Positions");
        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;

        ctrl.positionList = [];
        
        ctrl.retrievePositions = retrievePositionsData;
        ctrl.addEditPopup = addEditPopup;
        ctrl.save = save;
        //ctrl.changeStatus = changeStatus;
        
        function initialize(){
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
            $rootScope.positionModel = $modal.open({
                templateUrl: 'positionModel'
            });

            if(position == undefined) { 
                $rootScope.positionModel.position = {};
                $rootScope.positionModel.position.action = 'save';
            }else{
                $rootScope.positionModel.position = position;
                $rootScope.positionModel.position.action = 'update';
                if(position.positionGroup == undefined){
                    $rootScope.positionModel.position.positionGroup = [];
                }else{
                    $rootScope.positionModel.position.positionGroup = position.positionGroup.split(",");
                }
            }
            
            $rootScope.positionModel.closePopup = function(){

                $rootScope.positionModel.close();
            }

            $rootScope.positionModel.save = function(){
                ctrl.save($rootScope.positionModel.position);
                $rootScope.positionModel.close();
            }
            initMultiSelect();
        }

        function save(position){
            PositionDAO.update(position).then(function (res) {
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

        initialize();
    };

    angular.module('xenon.controllers').controller('ViewPositionsCtrl', ["PositionDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "$timeout", "$formService", ViewPositionsCtrl]);
})();