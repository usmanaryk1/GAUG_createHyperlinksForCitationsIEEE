(function() {
    'use strict';
    var CareTypeDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'caretypes/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'getall'
                }
            },
            retrieveForInsurer: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'getinsurance'
                }
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            retrieveForInsurer: function (data) {
                return api.retrieveForInsurer({'subAction':data.insurer_id}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('CareTypeDAO', ['$resource', CareTypeDAO]);
})();