(function () {
    'use strict';
    var EmployeeDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'employees/:action/:subAction/:subAction1', {}, {
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
            },
            verifySsn: {
                method: 'GET',
                params: {
                    action: 'verifyssn'
                },
                transformResponse: function (data, headersGetter, status) {
                    return {data: JSON.parse(data)};
                }
            },
            getEmployeeExceptUser: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'selectexceptruser'
                }
            },
            addNotes: {
                method: 'POST',
                params: {
                    subAction: 'note'
                }
            },
            getNotes: {
                method: 'GET',
                isArray: true
            },
            getTimeAvailability: {
                method: 'GET'
            },
            updateNotes: {
                method: 'PUT'
            },
            deleteNotes: {
                method: 'DELETE'
            },
            getOffset: {
                method: 'GET'
            },
            setOffset: {
                method: 'POST',
                params: {
                    subAction: 'offset'
                }
            },
            retrieveSettings: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'offset'
                }
            },
            saveSettings: {
                method: 'POST',
                params: {
                    action: 'offset'
                }
            },
            readNotes: {
                method: 'PUT'
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
                return api.get({action: params.id, includeTasks: params.includeTasks, includeAttachment: params.includeAttachment}).$promise;
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
            addNotes: function (data) {
                return api.addNotes({action: data.userId}, data.note).$promise;
            },
            updateNotes: function (data) {
                return api.updateNotes({action: data.userId, subAction: 'notes', subAction1: data.noteId}, data.note).$promise;
            },
            deleteNotes: function (data) {
                return api.deleteNotes({action: data.userId, subAction: 'notes', subAction1: data.noteId}, {}).$promise;
            },
            getNotes: function (params) {
                params.employeeId = params.userId;
                delete params.userId;
                return api.getNotes(params).$promise;
            },
            changestatus: function (data) {
                return api.changestatus({action: 'changestatus', subAction: data.id, status: data.status, reason: data.reason, terminationDate: data.terminationDate}).$promise;
            },
            getEmployeesForSchedule: function (data) {
                return api.getEmployeesForSchedule(data).$promise;
            },
            checkIfSsnExists: function (data) {
                return api.verifySsn(data).$promise;
            },
            getEmployeeExceptUser: function () {
                return api.getEmployeeExceptUser().$promise;
            },
            getTimeAvailability: function (params) {
                return api.getTimeAvailability({action: params.employeeId, subAction: 'timeavailability'}).$promise;
            },
            getOffset: function (params) {
                return api.getOffset({action: params.id, subAction: 'offset'}).$promise;
            },
            setOffset: function (data) {
                return api.setOffset({action: data.id}, data.offsets).$promise;
            },
            retrieveSettings: function (filter) {
                return api.retrieveSettings(filter).$promise;
            },
            saveSettings: function (data) {
                return api.saveSettings(data).$promise;
            },
            readNotes: function (params) {
                return api.readNotes({action: params.userId, subAction: 'notes', subAction1: 'read'},{}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('EmployeeDAO', ['$resource', EmployeeDAO]);
})();