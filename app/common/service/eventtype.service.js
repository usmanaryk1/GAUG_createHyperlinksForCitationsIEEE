(function () {
    'use strict';
    var EventTypeDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'eventTypes/:action/:subAction/:subAction1', {}, {
            retrieveEventType: {
                method: 'GET',
                isArray: false
            },
            saveForEventType: {
                method: 'POST'
            }
        });
        return {
            retrieveEventType: function (data) {
                return api.retrieveEventType({'action': data.eventType, 'subAction': data.id}).$promise;
            },
            saveForEventType: function (data) {
                return api.saveForEventType({action: data.action}, data.data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('EventTypeDAO', ['$resource', EventTypeDAO]);
})();