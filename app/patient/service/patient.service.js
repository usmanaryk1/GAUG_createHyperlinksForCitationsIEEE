(function () {
    'use strict';
    var PatientDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'patient/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            retrieveForCareType: {
                method: 'GET',
                isArray: false,
                params: {
                    action: 'view'
                },
                transformResponse: function (data, headers) {
                    var response = {};
                    response.data = JSON.parse(data);
                    response.headers = headers();
                    return response;
                }
            },
            retrieveForSelect: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'select'
                }
            },
            //this method will be used for patient save or update based on the action passed
            update: {
                method: 'POST'
            },
            delete: {
                method: 'GET'
            },
            changestatus: {
                method: 'GET'
            },
            getPatientsForSchedule: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'forschedule'
                }
            },
            checkSchedule: {
                method: 'GET',
                params: {
                    action: 'checkschedule'
                },
                transformResponse: function (data, headers) {
                    var response = {};
                    response.data = data;
                    return response;
                }
            }
        });
        return {
            retrieveAll: function (data) {
                return api.retrieveAll(data).$promise;
            },
            retrieveForCareType: function (data) {
                return api.retrieveForCareType(data).$promise;
            },
            retrieveForSelect: function (filter) {
                return api.retrieveForSelect(filter).$promise;
            },
            get: function (params) {
                return api.get({action: params.id}).$promise;
            },
            update: function (data) {
                return api.update({action: data.action, changeSchedule: data.changeSchedule}, data.data).$promise;
            },
            delete: function (data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status, reason: data.reason, dischargeDate:data.dischargeDate}).$promise;
            },
            getPatientsForSchedule: function (data) {
                return api.getPatientsForSchedule(data).$promise;
            },
            checkSchedule: function (data) {
                return api.checkSchedule(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('PatientDAO', ['$resource', PatientDAO]);
})();
