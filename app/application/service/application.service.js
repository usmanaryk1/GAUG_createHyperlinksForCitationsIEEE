(function () {
    'use strict';
    var ApplicationDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'applications/:action/:subAction/:subAction1/:id', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            delete: {
                method: 'DELETE'
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            delete: function (data) {
                return api.delete(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('ApplicationDAO', ['$resource', ApplicationDAO]);
})();