(function() {
    function AddCompanyCtrl($scope, $rootScope, CompanyDAO) {
        var ctrl = this;
        ctrl.companyObj = {};
        ctrl.companyObj.federalTax = "SS";
        ctrl.saveCompany = saveCompanyData;
        function saveCompanyData() {
            if ($('#company_information_form')[0].checkValidity()) {
                console.log('Company Object : ' + JSON.stringify(ctrl.companyObj));
                CompanyDAO.save(ctrl.companyObj).then(function() {

                });
            }
        }
        ;

    }
    ;
    angular.module('xenon.controllers').controller('AddCompanyCtrl', ["$scope", "$rootScope", "CompanyDAO", AddCompanyCtrl]);
})();