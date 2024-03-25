(function () {
    function ManualClaimCtrl($rootScope, $http, $state, $timeout, InsurerDAO) {
        var ctrl = this;
        //Constants i.e. we need to fill the form
        //healthInsuranceType = [{label: "Medicaid", value: "mcd"}, {label: "Medicare", value: "mcr"}, {label: "Tricare Champus", value: "tc"}, {label: "ChampVA", value: "cva"}, {label: "Group Healthplan", value: "gh"}, {label: "Feca Black Lung", value: "fbl"}, {label: "Blue Cross", value: "bc"}, {label: "Blue Shield", value: "bs"}, {label: "Blue Cross/Blue Sheild (BCBS)", value: "bcb"}, {label: "Other", value: "oth"}];
        ctrl.manualClaimObj = {};
        ctrl.reviewMode = false;
        if ($state.params.id && $state.params.id !== ''){
            ctrl.reviewMode = true;
            $rootScope.layoutOptions.sidebar.hideMenu = true;
            var claim1500 = JSON.parse(localStorage.getItem('claim1500'));
            if(claim1500 && claim1500[$state.params.id]){
                ctrl.manualClaimObj = claim1500[$state.params.id];
            }
        }
        
        ctrl.checkReviewMode = function(){
            if(ctrl.reviewMode)
                $("#manual_claim_form :input").prop("disabled", true);
        };

        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.payorList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
    }
    ;
    angular.module('xenon.controllers').controller('ManualClaimCtrl', ["$rootScope", "$http", "$state", "$timeout", "InsurerDAO", ManualClaimCtrl]);
})();