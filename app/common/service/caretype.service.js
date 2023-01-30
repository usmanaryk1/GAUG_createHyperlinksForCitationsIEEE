(function() {
    'use strict';
    var CareTypeDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'caretypes/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'getall'
                }
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('CareTypeDAO', ['$resource', CareTypeDAO]);
})();