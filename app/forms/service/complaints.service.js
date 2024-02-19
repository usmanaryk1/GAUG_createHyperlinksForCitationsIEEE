(function () {
    'use strict';
    var ComplaintDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'employees/:action/:subAction/:subAction1', {}, {

        });
        return {

        };
    };
    angular.module("xenon.factory").factory('ComplaintDAO', ['$resource', ComplaintDAO]);
})();