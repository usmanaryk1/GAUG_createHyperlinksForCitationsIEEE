(function () {
    'use strict';
    var EventTypeDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'events/:action/:subAction/:subAction1', {}, {
            retrieveEventType: {
                method: 'GET',
                isArray: false
            },
            saveEventType: {
                method: 'POST'
            },
            updateEventType: {
                method: 'PUT'
            },
            retireveBySchedule :{
                method: 'GET',
                isArray: true,
                params: {
                    action: 'all'
                }
            },
            delete:{
                method: 'DELETE'
            }
        });
        return {
            retrieveEventType: function (data) {
                return api.retrieveEventType(data).$promise;
            },
            saveEventType: function (data) {
                return api.saveEventType({action: data.action}, data.data).$promise;
            },
            updateEventType: function (data) {
                return api.updateEventType({action: data.action,subAction: data.subAction}, data.data).$promise;
            },
            retireveBySchedule: function (data) {
                return api.retireveBySchedule(data).$promise;
            },
            delete: function (data) {
                return api.delete(data).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('EventTypeDAO', ['$resource', EventTypeDAO]);
})();