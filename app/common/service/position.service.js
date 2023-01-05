(function() {
    'use strict';
    var PositionDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'positions/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                params: {
                    action: 'getall'
                },
                isArray: true
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('PositionDAO', ['$resource', PositionDAO]);
})();