(function() {
    'use strict';
    var TasksDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'companytasks/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('TasksDAO', ['$resource', TasksDAO]);
})();