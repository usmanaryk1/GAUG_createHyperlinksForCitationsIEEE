(function () {
    'use strict';
    var WorksiteDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'worksite/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            //this method will be used for worksite save or update based on the action passed
            update: {
                method: 'POST'
            },
            delete: {
                method: 'GET'
            }
        });
        return {
            retrieveAll: function (data) {
                return api.retrieveAll(data).$promise;
            },
            get: function (params) {
                return api.get({action: params.id}).$promise;
            },
            update: function (data) {
                return api.update({action: data.action, changeSchedule: data.changeSchedule}, data.data).$promise;
            },
            delete: function (data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('WorksiteDAO', ['$resource', WorksiteDAO]);
})();
