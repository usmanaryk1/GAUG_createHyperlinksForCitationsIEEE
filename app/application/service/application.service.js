(function() {
    'use strict';
    var ApplicationDAO = function(resource) {
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
            }
        };
    };
    angular.module("xenon.factory").factory('ApplicationDAO', ['$resource', ApplicationDAO]);
})();