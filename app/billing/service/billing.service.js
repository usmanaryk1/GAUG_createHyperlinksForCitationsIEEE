(function() {
    'use strict';
    var BillingDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'billing/:action', {}, {
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
            reviewSessions: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'review'
                }
            },
            processSessions: {
                method: 'POST',
                params: {
                    action: 'process'
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
            reviewSessions: function(param) {
                return api.reviewSessions(param).$promise;
            },
            processSessions: function(param,data) {
                return api.processSessions(param,data).$promise;
            }

        };
    };
    angular.module("xenon.factory").factory('BillingDAO', ['$resource', BillingDAO]);
})();
