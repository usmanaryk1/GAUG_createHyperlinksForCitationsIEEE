(function () {
    function FormSettingController($state, $stateParams,  $modal,FormsDAO, Page) {
        'use strict';
        var ctrl = this;
        Page.setTitle("Forms Setting");
        ctrl.complaintResDays;

        ctrl.formTypeList = angular.copy(ontime_data.formTypes);


        ctrl.typeChange = function(){
            // Typechange Code goes here
        }

        ctrl.saveFormSetting = function () {
            console.log(ctrl.complaintResDays);;
            if($('#formsetting_form')[0].checkValidity()){
                FormsDAO.setCompResolutionDays({complaintResDays: ctrl.complaintResDays}).then((res)=>{
                    console.log(res);
                }).catch((err)=>{
                    console.log(err);
                })
            }

        }

    }
    angular.module('xenon.controllers').controller('FormSettingController', ["$state", "$stateParams", "$modal","FormsDAO", "Page", FormSettingController]);
})();
