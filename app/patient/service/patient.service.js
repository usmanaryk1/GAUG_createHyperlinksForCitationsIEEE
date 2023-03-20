(function () {
    'use strict';
    var PatientDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'patient/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            //this method will be used for patient save or update based on the action passed
            update: {
                method: 'POST'
            },
            delete: {
                method: 'GET'
            },
            changestatus:{
                method: 'GET'
            }
        });
        return {
            retrieveAll: function (data) {
                return api.retrieveAll({subAction: data.status}).$promise;
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
            changestatus: function (data) {
                return api.changestatus({action:'changestatus', subAction:data.id, status:data.status}).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('PatientDAO', ['$resource', PatientDAO]);
})();
