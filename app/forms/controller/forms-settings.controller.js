(function () {
    function FormSettingController($state, $stateParams,  $modal,FormsDAO, Page) {
        'use strict';
        var ctrl = this;
        Page.setTitle("Forms Setting");
        ctrl.complaintResDays;

        ctrl.formTypeList = angular.copy(ontime_data.formTypes);


        ctrl.typeChange = function(){
            // Typechange Code goes here
            if(ctrl.formType == 'complaintform'){
                ctrl.getComplaintDays()
            }
        }

        ctrl.getComplaintDays = function (){
            FormsDAO.getComplaintPolicyResolutionTime().then(res => {
                ctrl.complaintResDays = res.policyResolutionTime;
            }).catch(err => {
                toastr.error("Couldn't get complaint policy resolution time")
            })
        }

        ctrl.saveFormSetting = function () {
            console.log(ctrl.complaintResDays);;
            if($('#formsetting_form')[0].checkValidity()){
                FormsDAO.setCompResolutionDays({complaintResDays: ctrl.complaintResDays}).then((res)=>{
                    console.log(res);
                    toastr.success("Complaint Resolution Days updated successfully")
                }).catch((err)=>{
                    console.log(err);
                    toastr.error("Couldn't update complaint resolution days")
                })
            }

        }

    }
    angular.module('xenon.controllers').controller('FormSettingController', ["$state", "$stateParams", "$modal","FormsDAO", "Page", FormSettingController]);
})();
