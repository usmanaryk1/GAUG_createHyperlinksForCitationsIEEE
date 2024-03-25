(function () {
    function ManualClaimCtrl($rootScope, $http, $stateParams, InsurerDAO) {
        var ctrl = this;
        //Constants i.e. we need to fill the form
        //healthInsuranceType = [{label: "Medicaid", value: "mcd"}, {label: "Medicare", value: "mcr"}, {label: "Tricare Champus", value: "tc"}, {label: "ChampVA", value: "cva"}, {label: "Group Healthplan", value: "gh"}, {label: "Feca Black Lung", value: "fbl"}, {label: "Blue Cross", value: "bc"}, {label: "Blue Shield", value: "bs"}, {label: "Blue Cross/Blue Sheild (BCBS)", value: "bcb"}, {label: "Other", value: "oth"}];
        ctrl.manualClaimObj = {};
        if($stateParams.claim1500Data){
            ctrl.manualClaimObj = JSON.parse($stateParams.claim1500Data);
        }

        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.payorList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
    }
    ;
    angular.module('xenon.controllers').controller('ManualClaimCtrl', ["$rootScope", "$http", "$stateParams", "InsurerDAO", ManualClaimCtrl]);
})();