(function() {
    function AddCompanyCtrl($scope, $rootScope, CompanyDAO, $formService) {
        var ctrl = this;
        ctrl.companyObj = {};
        ctrl.saveCompany = saveCompanyData;
        ctrl.initForm = function() {
            $("#company_information_form input:text, #company_information_form textarea").first().focus();
        };
        ctrl.retrieveCompany = function() {
            $rootScope.maskLoading();
            CompanyDAO.retrieveByCompanyCode({companyCode: ontimetest.company_code}).then(function(res) {
                ctrl.companyObj = res;
                if (ctrl.companyObj != null) {

                    if (ctrl.companyObj.federalIdType != null) {
                        $formService.setRadioValues('FederalTaxID', ctrl.companyObj.federalIdType);
                    }
                }

            }).catch(function() {
                toastr.error("Failed to retrieve Company Information.");
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };

        function saveCompanyData() {
            if ($('#company_information_form')[0].checkValidity()) {
                var companyObjToSave = angular.copy(ctrl.companyObj);
                console.log('Company Object : ' + JSON.stringify(companyObjToSave));
                $rootScope.maskLoading();
                CompanyDAO.save(companyObjToSave).then(function() {
                    toastr.success("Company Information saved.");
                    ctrl.retrieveCompany();
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            }
        }
        ;
        ctrl.retrieveCompany();

    }
    ;
    angular.module('xenon.controllers').controller('AddCompanyCtrl', ["$scope", "$rootScope", "CompanyDAO", "$formService", AddCompanyCtrl]);
})();