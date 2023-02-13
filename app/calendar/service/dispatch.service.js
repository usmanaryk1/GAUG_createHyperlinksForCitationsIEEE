(function () {
    'use strict';
    var DispatchDAO = function (resource) {
        var api = resource(ontime_data.weburl + 'dispatch/:action/:subAction', {}, {
            save: {
                method: 'POST'
            }
        });
        return {
            save: function (data) {
                return api.save(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('DispatchDAO', ['$resource', DispatchDAO]);
})();