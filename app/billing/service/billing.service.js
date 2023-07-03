(function() {
    'use strict';
    var BillingDAO = function(resource) {
        var api = resource(ontime_data.weburl + 'billing/:action/:paramId/:paramId2', {paramId:'@paramId'}, {
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
            searchReconciliations:{
                method: 'GET',
                isArray: false,
                params: {
                    action: 'reconciliations'
                },
                transformResponse: function (data, headers) {
                    var response = {};
                    response.data = JSON.parse(data);
                    response.headers = headers();
                    return response;
                }
            },
            saveClaimAdjustment:{
                method: 'POST',
                params: {
                    paramId2: 'adjustment',
                    action: 'claims'
                }
            },
            saveReconciliations:{
                method: 'POST',
                params: {
                    action: 'reconciliations'
                }
            },
            deleteReconciliations:{
                method: 'DELETE',
                params: {
                    action: 'reconciliations'
                }  
            },
            getReconciliation: {
                method: 'GET',
                isArray: false,
                params: {
                    action: 'reconciliations'
                }
            },
            deleteClaim:{
                method: 'DELETE',
                params: {
                    action: 'claims'
                }             
            },
            getCreditsAvailable:{
                method: 'GET',
                isArray: true,
                params: {
                    action: 'claims',
                    paramId: 'credit'
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
            searchReconciliations: function(data) {
                return api.searchReconciliations(data).$promise;
            },
            saveClaimAdjustment: function (data) {
                return api.saveClaimAdjustment({paramId: data.claimId}, data).$promise;
            },
            saveReconciliations: function (data) {
                return api.saveReconciliations(data).$promise;
            },
            deleteReconciliations: function(data) {
                return api.deleteReconciliations({paramId: data.id}).$promise;
            },
            getReconciliation: function(data) {
                return api.getReconciliation({paramId: data.id}).$promise;
            },
            deleteClaim: function(data) {
                return api.deleteClaim(data).$promise;
            },
            getCreditsAvailable: function (data) {
                return api.getCreditsAvailable(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('BillingDAO', ['$resource', BillingDAO]);
})();
