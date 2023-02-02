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

            });
        };

        function saveCompanyData() {
            if ($('#company_information_form')[0].checkValidity()) {
                console.log('Company Object : ' + JSON.stringify(ctrl.companyObj));
                if (ctrl.companyObj.federalId != null) {
                    ctrl.companyObj.federalId = JSON.stringify(ctrl.companyObj.federalId);
                }
                CompanyDAO.save(ctrl.companyObj).then(function() {
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