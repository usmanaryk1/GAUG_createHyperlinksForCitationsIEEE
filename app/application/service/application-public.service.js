(function() {
    'use strict';
    var ApplicationPublicDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'public/applications/:action/:subAction/:id/:companyCode', {}, {
            retrieveByApplicationId: {
                method: 'GET'
            },
            saveApplication: {
                method: "POST"
            },
            verifyExistingApplication: {
                method: "POST",
                params: {
                    action: "verify"
                }
            },
            updateApplication: {
                method: 'PUT'
            },
            submitApplication: {
                method: 'PUT'
            }
        });
        return {
            saveApplication: function(data) {
                return api.saveApplication(data).$promise;
            },
            verifyExistingApplication: function(data) {
                return api.verifyExistingApplication(data).$promise;
            },
            retrieveByApplicationId: function(data) {
                return api.retrieveByApplicationId(data).$promise;
            },
            updateApplication: function (data) {
                return api.updateApplication({action: data.applicationId}, data).$promise;
            },
            submitApplication: function (data) {
                return api.submitApplication({action: data.applicationId, subAction: 'submit'}, {}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('ApplicationPublicDAO', ['$resource', ApplicationPublicDAO]);
})();