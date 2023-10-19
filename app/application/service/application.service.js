(function () {
    'use strict';
    var ApplicationDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'applications/:action/:subAction/:subAction1/:id', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'view'
                }
            },
            delete: {
                method: 'DELETE'
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
            updateNotes: {
                method: 'PUT'
            },
            deleteNotes: {
                method: 'DELETE'
            },
            readNotes: {
                method: 'PUT'
            },
            approveApplication: {
                method: 'PUT'
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            delete: function (data) {
                return api.delete(data).$promise;
            },
            addNotes: function (data) {
                return api.addNotes({action: data.userId}, data.note).$promise;
            },
            updateNotes: function (data) {
                return api.updateNotes({action: data.userId, subAction: 'notes', subAction1: data.noteId}, data.note).$promise;
            },
            approveApplication: function (data) {
                return api.approveApplication({action: data.applicationId, subAction: 'approve'}, data.additionalDetails).$promise;
            },
            deleteNotes: function (data) {
                return api.deleteNotes({action: data.userId, subAction: 'notes', subAction1: data.noteId}, {}).$promise;
            },
            getNotes: function (params) {
                params.applicationId = params.userId;
                delete params.userId;
                return api.getNotes(params).$promise;
            },
            readNotes: function (params) {
                return api.readNotes({action: params.userId, subAction: 'notes', subAction1: 'read'},{}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('ApplicationDAO', ['$resource', ApplicationDAO]);
})();