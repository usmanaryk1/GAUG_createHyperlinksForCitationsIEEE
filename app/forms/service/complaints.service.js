(function () {
    'use strict';
    var ComplaintDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'complaint/:action/:subAction/:subAction1', {}, {
            addComplaint: {
                method: 'POST',
                params: {
                    action: 'new'
                }
            },
            getAllComplaints: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'getAllComplaints'
                }
            },
        });




        return {
            addComplaint: function (data) {
                return api.addComplaint(data).$promise;
            },
            getAllComplaints: function (data) {
                return api.getAllComplaints(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('ComplaintDAO', ['$resource', ComplaintDAO]);
})();