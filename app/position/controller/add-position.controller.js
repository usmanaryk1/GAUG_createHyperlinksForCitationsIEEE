(function () {
    function AddPositionCtrl($rootScope, $stateParams, $state, $modal, Page, $debounce, $timeout, $formService){
        var ctrl = this;

        $rootScope.openDialog = function(){
            $rootScope.addPositionModel = $modal.open({
                templateUrl: 'addPositionModel'
            });

            $rootScope.addPositionModel.closePopup = function(){
                $rootScope.addPositionModel.close();
            }

            $rootScope.addPositionModel.save = function(){
                alert('save');
                $rootScope.addPositionModel.close();
            }

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
    };

    angular.module('xenon.controllers').controller('AddPositionCtrl', ["$rootScope", "$stateParams", "$state", 
        "$modal", "Page", "$debounce", "$timeout", "$formService", AddPositionCtrl]);
})();