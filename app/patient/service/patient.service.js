(function () {
    'use strict';
    var PatientDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'patients/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'all'
                }
            },
            //this method will be used for patient save or update based on the action passed
            update: {
                method: 'POST'
            },
            delete: {
                method: 'GET'
            },
            discharge: {
                method: 'GET'
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            get: function (params) {
                return api.get({action: params.id}).$promise;
            },
            update: function (data) {
                return api.update({action: data.action}, data.data).$promise;
            },
            delete: function (data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            },
            discharge: function (data) {
                return api.delete({action: 'discharge', subAction: data.id}).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('PatientDAO', ['$resource', PatientDAO]);
})();
