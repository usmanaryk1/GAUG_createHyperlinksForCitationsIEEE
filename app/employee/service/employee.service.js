(function() {
    'use strict';
    var EmployeeDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'employees/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'all'
                }
            },
            //this method will be used for employee save or update based on the action passed
            update: {
                method: 'POST'
            },
            //this method will be used for employee save or update based on the action passed
            updateCareRates: {
                method: 'POST',
                params:{
                    action:'updatecarerates'
                }
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            get: function (params) {
                return api.get({action:params.id}).$promise;
            },
            save: function (data) {
                return api.save(data).$promise;
            },
            update: function (data) {
                return api.update({action:data.action}, data.data).$promise;
            },
            updateCareRates: function (data) {
                return api.updateCareRates(data).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('EmployeeDAO', ['$resource', EmployeeDAO]);
})();