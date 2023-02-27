(function() {
    function AddCompanyCtrl($scope, $rootScope, CompanyDAO, $formService) {
        var ctrl = this;
        ctrl.companyObj = {};
        ctrl.saveCompany = saveCompanyData;
        ctrl.initForm=function(){
            $("#company_information_form input:text, #company_information_form textarea").first().focus();
        };
        ctrl.retrieveCompany = function() {
            CompanyDAO.retrieveByCompanyCode({companyCode: ontimetest.company_code}).then(function(res) {
                ctrl.companyObj = res;
                if (ctrl.companyObj != null) {
                    
                    if (ctrl.companyObj.federalIdType != null) {
                        $formService.setRadioValues('FederalTaxID', ctrl.companyObj.federalIdType);
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