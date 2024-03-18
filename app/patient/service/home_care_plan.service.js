(function () {
    'use strict';
    var HomeCarePlanDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'patients/:patientId/homecareplan/:id/:action', {}, { // change this
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'retrieveAll'
                }
            },
            saveRecord: {
                method: "POST"
            },
             //this method will be used for patient save or update based on the action passed
             addHomeCarePlan: {
                method: 'POST',
                params: {
                    action: 'addHomeCarePlan'
                }
            },
            updateHomeCarePlan: {
                method: 'PUT',
                params: {
                    action: 'updateHomeCarePlan'
                }
            },
            deleteHomeCarePlan: {
                method: 'GET',
                params: {
                    action: 'deleteHomeCarePlan'
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
            addHomeCarePlan: function (data) {
                console.log("service addHomeCarePlan, data", data);
                return api.addHomeCarePlan({patientId: data.patientId}, data).$promise;
            },
            updateHomeCarePlan: function (data) {
                console.log("service updateHomeCarePlan, data", data);
                return api.updateHomeCarePlan({subAction: data.id}, data).$promise
            },
            deleteHomeCarePlan: function (data) {
                return api.deleteHomeCarePlan({action: 'delete', subAction: data.id}).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('HomeCarePlanDAO', ['$resource', HomeCarePlanDAO]);
})();
