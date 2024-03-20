(function () {
    'use strict';
    var PatientRecordDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'patients/:patientId/records/:id/:action', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                // params: {
                //     action: 'retrieveAll'
                // }
            },
            saveRecord: {
                method: "POST"
            },
             //this method will be used for patient save or update based on the action passed
             addMedOrder: {
                method: 'POST',
                params: {
                    action: 'addMedOrder'
                }
            },
            updateMedOrder: {
                method: 'PUT',
                params: {
                    action: 'updateMedOrder'
                }
            },
            deleteMedOrder: {
                method: 'GET',
                params: {
                    action: 'deleteMedOrder'
                }
            },
        });
        return {
            retrieveAll: function (data) {
                return api.retrieveAll({patientId: data.patientId}).$promise;
            },
            saveRecord: function (data) {
                return api.saveRecord({patientId: data.patientId}, data).$promise;
            },
            addMedOrder: function (data) {
                console.log("service addMedOrder, data", data);
                return api.addMedOrder({patientId: data.patientId}, data).$promise;
            },
            updateMedOrder: function (data) {
                console.log("service updateMedOrder, data", data);
                return api.updateMedOrder({subAction: data.id}, data).$promise
            },
            deleteMedOrder: function (data) {
                return api.deleteMedOrder({action: 'delete', subAction: data.id}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('PatientRecordDAO', ['$resource', PatientRecordDAO]);
})();
