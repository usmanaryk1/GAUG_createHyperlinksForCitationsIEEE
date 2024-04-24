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
            },
            //this method will be used for user save or update based on the action passed
            update: {
                method: 'POST'
            },
            changestatus: {
                method: 'GET'
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            update: function (data) {
                return api.update({action: data.action}, data.data).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status, positionStatus: data.positionStatus}).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('PositionDAO', ['$resource', PositionDAO]);
})();