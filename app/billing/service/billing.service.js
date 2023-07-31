(function() {
    'use strict';
    var BillingDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'billing/:action/:paramId', {paramId:'@paramId'}, {
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
            },
            getPatientDetails: {
                method: 'GET',
                params: {
                    action: 'manualclaim'
                }
            },
            processManualClaim: {
                method: 'POST',
                params: {
                    action: 'process',
                    paramId: 'manualclaim'
                }
            },
            searchClaims:{
                method: 'GET',
                isArray: true,
                params: {
                    action: 'claims'
                }
            },
            deleteBatch:{
                method: 'DELETE',
                params: {
                    action: 'sessions'
                }             
            },
            deleteClaim:{
                method: 'DELETE',
                params: {
                    action: 'claims'
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
            },
            getPatientDetails: function(param) {
                return api.getPatientDetails(param).$promise;
            },
            processManualClaim: function(param, data) {
                return api.processManualClaim(param, data).$promise;
            },
            searchClaims: function(data) {
                return api.searchClaims(data).$promise;
            },
            deleteBatch: function(data) {
                return api.deleteBatch(data).$promise;
            },
            deleteClaim: function(data) {
                return api.deleteClaim(data).$promise;
            }

        };
    };
    angular.module("xenon.factory").factory('BillingDAO', ['$resource', BillingDAO]);
})();
