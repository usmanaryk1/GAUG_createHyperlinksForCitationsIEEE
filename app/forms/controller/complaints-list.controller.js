(function () {
    function ComplaintsController($state, $rootScope, $stateParams, $modal, FormsDAO, $debounce,$sce, Page) {
        'use strict';
        Page.setTitle("Complaints")
        var ctrl = this;
        ctrl.searchParams = { pageSize: 10, pageNumber: 1, name: '' };
        ctrl.complaintType = $stateParams.status;
        ctrl.complaintsList = [];
        ctrl.pageInitCall = pageInit;
        ctrl.getComplaintsCall = getComplaints;
        ctrl.remainingDaysToCloseCall = remainingDaysToClose
        ctrl.getComplaintCloseDaysCall = getComplaintCloseDays
        ctrl.currentDate = new Date();

        ctrl.pageInitCall();

        ctrl.openViewModal = function (complaint, modal_id, modal_size, modal_backdrop) {
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


        ctrl.setComplaint = function(complaint){
            localStorage.setItem('complaint', JSON.stringify(complaint));
        }

        function remainingDaysToClose (dateInserted, proposedDate) {
            const dateInsertedObj = new Date(dateInserted);
            const proposedDateObj = new Date(proposedDate);
        
            const timeDiff = proposedDateObj - dateInsertedObj;
            const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            console.log(daysRemaining);
        
            if (daysRemaining < 0) {
                return `<span style="color: #cc3f44">Overdue ${daysRemaining}</span>`;
            } else {
                return daysRemaining >= 0 ? `${daysRemaining + 1}` : '';
                // return daysRemaining > 0 ? `${daysRemaining}` : '<span style="color: #cc3f44;">Last Day</span>';
                // return daysRemaining + 1;
            }
        }

        function getComplaintCloseDays() {
            FormsDAO.getComplaintPolicyResolutionTime().then(res => {
                ctrl.complaintResDays = res.policyResolutionTime;
            }).catch(err => {
                toastr.error("Couldn't get complaint policy resolution time")
            })
        }

        function pageInit() {
            // let not = $rootScope.notificationsArr.find(item => item.id == 'CREATE_COMPLAINT');
            // let index = $rootScope.notificationsArr.indexOf(not);
            // $rootScope.notificationsArr.splice(index, 1);
            ctrl.getComplaintCloseDaysCall()
            ctrl.getComplaintsCall()
        }

        ctrl.getRemainingDaysForClosing = function (complaint) {
            return ctrl.remainingDaysToCloseCall(complaint.dateInserted, complaint.dateProposedResolution);
        }

        ctrl.applySearch = function () {
            ctrl.searchParams.pageNo = 1;
            $debounce(getComplaints, 500);
        };

        function getComplaints() {
            if(ctrl.complaintType == 'open'){
                ctrl.searchParams.isFollowUpNeeded = true;
            }else if(ctrl.complaintType == 'close'){
                ctrl.searchParams.isFollowUpNeeded = false;
            }

            FormsDAO.getAllComplaints(ctrl.searchParams).then((res) => {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {}
                }); // showLoadingBar

                if (res) {
                    ctrl.complaintsList = res;
                    if(ctrl.searchParams.isFollowUpNeeded == true)
                    $rootScope.currentUser.complaintNotification = $rootScope.totalRecords;
                }
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve complaints.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {}
                }); // showLoadingBar
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });
        }

        ctrl.pageChanged = function (pagenumber) {
            ctrl.searchParams.pageNumber = pagenumber;
            getComplaints();
        };

        ctrl.sanitizeHtml = function (htmlContent) {
            return $sce.trustAsHtml(htmlContent)
        };
        
        ctrl.openDeleteModal = function (complaint, modal_id, modal_size, modal_backdrop)
        {
            console.log(complaint);
            $rootScope.deleteComplaintModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.deleteComplaintModel.complaint = complaint;

            $rootScope.deleteComplaintModel.delete = function (complaint) {
                $rootScope.maskLoading();
                FormsDAO.deleteComplaint({id: complaint.id}).then(function (res) {
                    toastr.success("Complaint deleted.");
                    $rootScope.deleteComplaintModel.close();
                    getComplaints();
                }).catch(function () {
                    toastr.error('Delete complaint failed');
                    $rootScope.deleteComplaintModel.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };
        };

    }
    angular.module('xenon.controllers').controller('ComplaintsController', ["$state", "$rootScope", "$stateParams", "$modal", "FormsDAO", "$debounce","$sce", "Page", ComplaintsController]);
})();
