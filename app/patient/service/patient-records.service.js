(function () {
    'use strict';
    var PatientRecordDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'patients/:patientId/records/:id/:action', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true
            },
            saveRecord: {
                method: "POST"
            }
        });
        return {
            retrieveAll: function (data) {
                return api.retrieveAll({patientId: data.patientId}).$promise;
            },
            saveRecord: function (data) {
                return api.saveRecord({patientId: data.patientId}, data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('PatientRecordDAO', ['$resource', PatientRecordDAO]);
})();
