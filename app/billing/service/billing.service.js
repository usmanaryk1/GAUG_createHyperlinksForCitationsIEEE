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
            }
        });
        return {
            updateSettings: function(data) {
                return api.updateSettings(data).$promise;
            },
            getSettings: function() {
                return api.getSettings().$promise;
            }

        };
    };
    angular.module("xenon.factory").factory('BillingDAO', ['$resource', BillingDAO]);
})();
