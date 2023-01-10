(function() {
    'use strict';
    var patientDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'patients/:action/:subAction/:subAction1', {}, {
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
    angular.module("xenon.factory").factory('patientDAO', ['$resource', patientDAO]);
})();
