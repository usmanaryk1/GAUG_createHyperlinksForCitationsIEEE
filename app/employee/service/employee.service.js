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
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('EmployeeDAO', ['$resource', EmployeeDAO]);
})();