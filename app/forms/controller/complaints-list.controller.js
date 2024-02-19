(function () {
    function ComplaintsController($state, $rootScope,  $stateParams,  $modal, Page) {
        'use strict';
        Page.setTitle("Complaints")
        var ctrl = this;

        ctrl.complaintType = $stateParams.status;
        ctrl.complaintsList = [];
        ctrl.pageInitCall = pageInit;
        ctrl.complaintsList.push({
            id: 1243,
            date: '21/265/21',
            type: 'Safety',
            name: 'Complaint',
            method: 'test',
            contactInfo: 'contact',
            resolutionDate: '21/265/21',
            receivedBy: 'contact'
        })
        
        ctrl.pageInitCall();

        ctrl.openEditModal = function (complaint, modal_id, modal_size, modal_backdrop)
        {
            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('common', 'complaint-info'),
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false,
                controller: 'ComplaintInfoCtrl as ComplaintInfo',
                resolve: {
                    complaintId: function () {
                        return complaint.id;
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("popup closed");
            });
        };

        function pageInit () {
            let not = $rootScope.notificationsArr.find(item => item.id == 'VIEW_DISPATCH');
            let index = $rootScope.notificationsArr.indexOf(not);
            console.log(index);
            $rootScope.notificationsArr.splice(index, 1);
        }

        ctrl.searchParams = {limit: 10, pageNo: 1, sortBy: 'lName', order: 'asc', name: ''};
    }
    angular.module('xenon.controllers').controller('ComplaintsController', ["$state","$rootScope", "$stateParams", "$modal", "Page", ComplaintsController]);
})();
