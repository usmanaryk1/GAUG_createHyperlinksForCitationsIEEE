(function() {
    'use strict';
    var ReportDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'report/:action/:subAction/:subAction1', {}, {
            //this method will be used for employee save or update based on the action passed
        });
        return {
        };
    };
    angular.module("xenon.factory").factory('ReportDAO', ['$resource', ReportDAO]);
})();
