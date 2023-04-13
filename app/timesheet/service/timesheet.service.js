(function() {
    'use strict';
    var TimesheetDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'timesheets/:action/:subAction/:subAction1/:id', {}, {
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
            },
            addPunchRecord: {
                method: 'POST',
                params: {
                    action: 'addpunch'
                }
            },
            retrievePatientTimeSheet: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'withindate'
                }
            },
            retrieveEmployeeTimeSheet: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'withindate'
                }
            },
            delete: {
                method: 'GET'
            },
            get: {
                params: {
                    action: 'get'
                }
            },
            update: {
                method: 'POST',
                params: {
                    action: 'update'
                }
            }
        });
        return {
            retrieveAllDailyAttendance: function(filter) {
                return api.retrieveAllDailyAttendance(filter).$promise;
            },
            retrievePatientTimeSheet: function(filter) {
                return api.retrievePatientTimeSheet(filter).$promise;
            },
            retrieveEmployeeTimeSheet: function(filter) {
                return api.retrieveEmployeeTimeSheet(filter).$promise;
            },
            query: function(filter) {
                return api.query(filter).$promise;
            },
            addPunchRecord: function(data) {
                return api.addPunchRecord(data).$promise;
            },
            delete: function(data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            },
            get: function(data) {
                return api.get(data).$promise;
            },
            update: function(data) {
                return api.update(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('TimesheetDAO', ['$resource', TimesheetDAO]);
})();