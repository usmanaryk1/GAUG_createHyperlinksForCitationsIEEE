(function() {
    'use strict';
    var PayrollDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'payrolls/:action/:subAction/:subAction1', {}, {
            //this method will be used for employee save or update based on the action passed
            updateSettings: {
                method: 'POST',
                params: {
                    action: 'settings'
                }
            },
            getSettings: {
                method: 'GET',
                params: {
                    action: 'settings'
                }
            },
            getHistory: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'sessions'
                }
            }
        });
        return {
            updateSettings: function(data) {
                return api.updateSettings(data).$promise;
            },
            getSettings: function() {
                return api.getSettings().$promise;
            },
            getHistory: function(data) {
                return api.getHistory(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('PayrollDAO', ['$resource', PayrollDAO]);
})();
