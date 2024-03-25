(function() {
    'use strict';
    var BillingDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'billing/:action/:paramId', {paramId:'@paramId'}, {
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
            searchSessions: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'sessions'
                }
            },
            getSessionById: {
                method: 'GET',
                params: {
                    action: 'sessions'
                }
            },
            getClaimById: {
                method: 'GET',
                params: {
                    action: 'claim'
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
            searchSessions: function(param) {
                return api.searchSessions(param).$promise;
            },
            getSessionById: function(param) {
                return api.getSessionById(param).$promise;
            },
            getClaimById: function(param) {
                return api.getClaimById(param).$promise;
            },
            processSessions: function(param,data) {
                return api.processSessions(param,data).$promise;
            }

        };
    };
    angular.module("xenon.factory").factory('BillingDAO', ['$resource', BillingDAO]);
})();
