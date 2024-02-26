(function () {
    function ComplaintsController($state, $rootScope, $stateParams, $modal, FormsDAO, Page) {
        'use strict';
        Page.setTitle("Complaints")
        var ctrl = this;
        ctrl.searchParams = { limit: 10, pageNo: 1 };
        ctrl.complaintType = $stateParams.status;
        ctrl.complaintsList = [];
        ctrl.pageInitCall = pageInit;
        ctrl.getComplaintsCall = getComplaints;
        ctrl.remainingDaysToCloseCall = remainingDaysToClose
        ctrl.getComplaintCloseDaysCall = getComplaintCloseDays
        ctrl.currentDate = new Date();
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

        ctrl.openEditModal = function (complaint, modal_id, modal_size, modal_backdrop) {
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

        ctrl.setComplaint = function(complaint){
            localStorage.setItem('complaint', JSON.stringify(complaint));
        }

        function remainingDaysToClose (openDate, margin, currentDate) {
            // Convert date strings to Date objects
            const openDateObj = new Date(openDate);
            const currentDateObj = new Date(currentDate);

            // Calculate the difference in milliseconds
            const timeDiff = currentDateObj - openDateObj;

            // Calculate the number of days
            const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

            // Calculate the remaining days
            const remainingDays = margin - daysPassed;

            // Ensure the result is at least 0
            return Math.max(remainingDays, 0);
        }

        function getComplaintCloseDays() {
            FormsDAO.getComplaintPolicyResolutionTime().then(res => {
                ctrl.complaintResDays = res.policyResolutionTime;
            }).catch(err => {
                toastr.error("Couldn't get complaint policy resolution time")
            })
        }

        function pageInit() {
            let not = $rootScope.notificationsArr.find(item => item.id == 'VIEW_DISPATCH');
            let index = $rootScope.notificationsArr.indexOf(not);
            $rootScope.notificationsArr.splice(index, 1);
            ctrl.getComplaintCloseDaysCall()
            ctrl.getComplaintsCall()
        }

        ctrl.getRemainingDaysForClosing = function (openDate) {
            return ctrl.remainingDaysToCloseCall(openDate, ctrl.complaintResDays, ctrl.currentDate);
        }

        function getComplaints() {
            if(ctrl.complaintType == 'open'){
                ctrl.searchParams.complaintFollowUp = true;
            }else if(ctrl.complaintType == 'close'){
                ctrl.searchParams.complaintFollowUp = false;
            }
            FormsDAO.getAllComplaints(ctrl.searchParams).then((res) => {
                console.log(res);
                ctrl.complaintsList = res;
                // toastr.success("Complaints retrieved successfully")
            }).catch((err) => {
                console.log(err);
                toastr.error("Failed to retrieve complaints")
            })
        }

        ctrl.pageChanged = function (pagenumber) {
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.getComplaintsCall();
        };

    }
    angular.module('xenon.controllers').controller('ComplaintsController', ["$state", "$rootScope", "$stateParams", "$modal", "FormsDAO", "Page", ComplaintsController]);
})();
