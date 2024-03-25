(function () {
    'use strict';
    var UserDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'admin/user/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            //this method will be used for user save or update based on the action passed
            update: {
                method: 'POST'
            },
            delete: {
                method: 'GET'
            },
            changestatus: {
                method: 'GET'
            },
            getAllRoles: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'allroles'
                }
            },
            changePassword: {
                method: 'POST',
                params: {
                    action: "changepassword"
                }
            }

        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            update: function (data) {
                return api.update({action: data.action}, data.data).$promise;
            },
            delete: function (data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status}).$promise;
            },
            get: function (params) {
                return api.get({action: params.id}).$promise;
            },
            getAllRoles: function () {
                return api.getAllRoles().$promise;
            },
            changePassword: function (data) {
                return api.changePassword(data).$promise;
            }

        };
    };
    angular.module("xenon.factory").factory('UserDAO', ['$resource', UserDAO]);
})();
