(function () {
    function ComplaintsController($state, $rootScope,  $stateParams,  $modal, FormsDAO, Page) {
        'use strict';
        Page.setTitle("Complaints")
        var ctrl = this;
        ctrl.searchParams = {limit: 10, pageNo: 1};

        ctrl.complaintType = $stateParams.status;
        ctrl.complaintsList = [];
        ctrl.pageInitCall = pageInit;
        ctrl.getComplaintsCall = getComplaints;
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
                    complaint: function () {
                        return complaint;
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log("popup closed");
            });
        };

        // ctrl.applySortingClass = function (sortBy) {
        //     if (ctrl.searchParams.sortBy !== sortBy) {
        //         return 'sorting';
        //     } else {
        //         if (ctrl.searchParams.order === "desc") {
        //             return 'sorting_desc';
        //         } else {
        //             return 'sorting_asc';
        //         }
        //     }
        // };

        function pageInit () {
            let not = $rootScope.notificationsArr.find(item => item.id == 'VIEW_DISPATCH');
            let index = $rootScope.notificationsArr.indexOf(not);
            console.log(index);
            $rootScope.notificationsArr.splice(index, 1);
            ctrl.getComplaintsCall()
        } 

        function getComplaints() {
            FormsDAO.getAllComplaints(ctrl.searchParams).then((res)=>{
                console.log(res);
                ctrl.complaintsList = res;
                toastr.success("Complaints retrieved successfully")
            }).catch((err)=>{
                console.log(err);
                toastr.error("Failed to retrieve all complaints")
            })
        }

        ctrl.pageChanged = function (pagenumber) {
            console.log("pagenumber", pagenumber);
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.getAllComplaints();
        };

    }
    angular.module('xenon.controllers').controller('ComplaintsController', ["$state","$rootScope", "$stateParams", "$modal", "FormsDAO", "Page", ComplaintsController]);
})();
