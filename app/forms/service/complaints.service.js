(function () {
    'use strict';
    var ComplaintDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'complaint/:action/:subAction/:subAction1', {}, {
            addComplaint: {
                method: 'POST',
                params: {
                    subAction: 'new'
                }
            },
        });
        return {
            addComplaint: function (data) {
                return api.addComplaint(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('ComplaintDAO', ['$resource', ComplaintDAO]);
})();