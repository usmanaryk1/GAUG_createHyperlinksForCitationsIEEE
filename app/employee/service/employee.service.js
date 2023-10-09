(function () {
    'use strict';
    var EmployeeDAO = function (resource) {
        var api = resource(ontimetest.weburl + 'employees/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            retrieveByPosition: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'select'
                }
            },
            retrieveEmployeeCareRates: {
                method: 'GET',
                params: {
                    action: 'carerates'
                }
            },
            //this method will be used for employee save or update based on the action passed
            update: {
                method: 'POST'
            },
            //this method will be used for employee save or update based on the action passed
            updateCareRates: {
                method: 'POST',
                params: {
                    action: 'updatecarerates'
                }
            },
            delete: {
                method: 'GET'
            },
            changestatus: {
                method: 'GET'
            },
            getEmployeesForSchedule: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'forschedule'
                }
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            retrieveByPosition: function (filter) {
                return api.retrieveByPosition(filter).$promise;
            },
            retrieveEmployeeCareRates: function (filter) {
                return api.retrieveEmployeeCareRates({subAction: filter.employee_id}).$promise;
            },
            get: function (params) {
                return api.get({action: params.id, includeTasks: params.includeTasks}).$promise;
            },
            save: function (data) {
                return api.save(data).$promise;
            },
            update: function (data) {
                return api.update({action: data.action}, data.data).$promise;
            },
            updateCareRates: function (data) {
                return api.updateCareRates(data).$promise;
            },
            delete: function (data) {
                return api.delete({action: 'delete', subAction: data.id}).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status}).$promise;
            },
            getEmployeesForSchedule: function (data) {
                return api.getEmployeesForSchedule(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('EmployeeDAO', ['$resource', EmployeeDAO]);
})();
