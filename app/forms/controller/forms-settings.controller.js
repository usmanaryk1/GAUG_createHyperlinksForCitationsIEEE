(function () {
    function FormSettingController($state, $stateParams,  $modal, Page) {
        'use strict';
        Page.setTitle("Forms Setting");
        var ctrl = this;

        ctrl.formTypeList = angular.copy(ontime_data.formTypes);


        ctrl.typeChange = function(){
            // Typechange Code goes here
        }

    }
    angular.module('xenon.controllers').controller('FormSettingController', ["$state", "$stateParams", "$modal", "Page", FormSettingController]);
})();
