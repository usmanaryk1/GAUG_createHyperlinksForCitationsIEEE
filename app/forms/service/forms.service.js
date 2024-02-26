(function () {
    'use strict';
    var FormsDAO = function (resource) {
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
            setCompResolutionDays: {
                method: 'POST',
                // params: {
                //     // action: 'saveComplaintPolicyResolutionTime',
                //     // complaintResDays: "@complaintResDays"
                // }
            },
            getComplaintPolicyResolutionTime: {
                method: 'GET',
                params: {
                    action: 'getComplaintPolicyResolutionTime'
                }
            }
        });




        return {
            addComplaint: function (data) {
                return api.addComplaint(data).$promise;
            },
            getAllComplaints: function (data) {
                return api.getAllComplaints(data).$promise;
            },
            setCompResolutionDays: function (data){
                console.log(data);
                return api.setCompResolutionDays({action: 'saveComplaintPolicyResolutionTime' + data.complaintResDays}, {}).$promise
            },
            getComplaintPolicyResolutionTime: function (){
                return api.getComplaintPolicyResolutionTime().$promise
            }
        };
    };
    angular.module("xenon.factory").factory('FormsDAO', ['$resource', FormsDAO]);
})();