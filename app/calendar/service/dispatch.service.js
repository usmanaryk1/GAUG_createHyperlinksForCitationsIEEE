(function () {
    'use strict';
    var DispatchDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'dispatch/:action/:subAction', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true
            },
            save: {
                method: 'POST'
            },
            saveResponse: {
                method: 'POST'
            },
            delete: {
                method: 'DELETE'
            }
        });
        return {
            retrieveAll: function (params) {
                return api.retrieveAll(params).$promise;
            },
            get: function (params) {
                return api.get({action: params.id}).$promise;
            },
            save: function (data) {
                return api.save(data).$promise;
            },
            saveResponse: function (params,data) {
                return api.saveResponse({action: params.id,subAction:"response"}, data).$promise;
            },
            delete: function (data) {
                return api.delete({action: data.id}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('DispatchDAO', ['$resource', DispatchDAO]);
})();