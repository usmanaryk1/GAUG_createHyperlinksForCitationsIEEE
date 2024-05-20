(function() {
    'use strict';
    var TasksDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'companytasks/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true
            },
            changestatus: {
                method: 'GET'
            },
            view: {
                method: 'GET',
                params: {
                    action: 'view'
                },
                isArray: true
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status}).$promise;
            },
            view: function (filter) {
                return api.view(filter).$promise;
            },
        };
    };
    angular.module("xenon.factory").factory('TasksDAO', ['$resource', TasksDAO]);
})();