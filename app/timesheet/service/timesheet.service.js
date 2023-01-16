(function() {
    'use strict';
    var TimesheetDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'timesheets/:action/:subAction/:subAction1', {}, {
            retrieveAllDailyAttendance: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'dailyattendance'
                }
            },
            query: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'all'
                }
            }
        });
        return {
            retrieveAllDailyAttendance: function(filter) {
                return api.retrieveAllDailyAttendance(filter).$promise;
            },
            query: function(filter) {
                return api.query(filter).$promise;
            },
            save: function(data) {
                return api.save(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('TimesheetDAO', ['$resource', TimesheetDAO]);
})();