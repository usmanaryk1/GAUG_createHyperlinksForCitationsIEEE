(function() {
    function AddCompanyCtrl($scope, $rootScope, CompanyDAO, $formService) {
        var ctrl = this;
        ctrl.companyObj = {};
        ctrl.companyObj.federalTax = "SS";
        ctrl.saveCompany = saveCompanyData;
        ctrl.retrieveCompany = function() {
            CompanyDAO.retrieveByCompanyCode({companyCode: ontimetest.company_code}).then(function(res) {
                ctrl.companyObj = res;
                if (ctrl.companyObj != null && ctrl.companyObj.federalId != null) {
                    ctrl.companyObj.federalId = JSON.parse(ctrl.companyObj.federalId);
                    if (ctrl.companyObj.federalId.type != null) {
                        $formService.setRadioValues('FederalTaxID', ctrl.companyObj.federalId.type);
                    }
                }

            }).catch(function(){
                toastr.error("Failed to retrieve Company Information.");
            });
        };

        function saveCompanyData() {
            if ($('#company_information_form')[0].checkValidity()) {
                var companyObjToSave=angular.copy(ctrl.companyObj);
                console.log('Company Object : ' + JSON.stringify(companyObjToSave));
                if (companyObjToSave.federalId != null) {
                    companyObjToSave.federalId = JSON.stringify(companyObjToSave.federalId);
                }
                CompanyDAO.save(companyObjToSave).then(function() {
                    toastr.success("Company Information saved.");
                    ctrl.retrieveCompany();
                });
            }
        }
        ;
        ctrl.retrieveCompany();

    }
    ;
    angular.module('xenon.controllers').controller('AddCompanyCtrl', ["$scope", "$rootScope", "CompanyDAO", "$formService", AddCompanyCtrl]);
})();