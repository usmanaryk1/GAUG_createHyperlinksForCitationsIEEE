(function() {
    'use strict';
    var CompanyDAO = function(resource) {
        var api = resource(ontimetest.weburl + 'companies/:action/:subAction/:subAction1', {}, {
            retrieveAll: {
                method: 'GET',
                isArray: true,
                params: {
                    action: 'all'
                }
            }
        });
        return {
            retrieveAll: function (filter) {
                return api.retrieveAll(filter).$promise;
            },
            save:function(data){
                return api.save(data).$promise;
            }
        };
    };
    angular.module("xenon.factory").factory('CompanyDAO', ['$resource', CompanyDAO]);
})();