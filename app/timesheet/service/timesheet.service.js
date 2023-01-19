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
            },
            addPunchRecord:{
                method:'POST',
                params:{
                    action:'addemployeepunchrecord'
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
            addPunchRecord:function(){
                return api.addPunchRecord().$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('TimesheetDAO', ['$resource', TimesheetDAO]);
})();