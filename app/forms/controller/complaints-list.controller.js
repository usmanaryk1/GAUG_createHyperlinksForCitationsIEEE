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

        function remainingDaysToClose (openDate, margin, currentDate) {
            // const openDateObj = new Date(openDate);
            // const currentDateObj = new Date(currentDate);
            // const timeDiff = currentDateObj - openDateObj;
            // const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            // const remainingDays = margin - daysPassed;
            // return Math.max(remainingDays, 0);

            const openDateObj = new Date(openDate);
            const currentDateObj = new Date(currentDate);
        
            const timeDiff = currentDateObj - openDateObj;
            const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
            if (daysPassed > margin) {
                return `<span style="color: #cc3f44">Overdue ${daysPassed - margin}</span>`;
            } else {
                const remainingDays = margin - daysPassed;
                return remainingDays > 0 ? `${remainingDays}` : '<span style="color: #cc3f44;">Last Day</span>';
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

        ctrl.getRemainingDaysForClosing = function (openDate) {
            return ctrl.remainingDaysToCloseCall(openDate, ctrl.complaintResDays, ctrl.currentDate);
        }

        ctrl.applySearch = function () {
            ctrl.searchParams.pageNo = 1;
            $debounce(getComplaints, 500);
        };

        function getComplaints() {
            if(ctrl.complaintType == 'open'){
                ctrl.searchParams.complaintFollowUp = true;
            }else if(ctrl.complaintType == 'close'){
                ctrl.searchParams.complaintFollowUp = false;
            }

            FormsDAO.getAllComplaints(ctrl.searchParams).then((res) => {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {}
                }); // showLoadingBar

                if (res) {
                    ctrl.complaintsList = res;
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

        ctrl.deleteComplaint = function (id){
            console.log(id);
            FormsDAO.deleteComplaint(id).then(res => {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {}
                }); // showLoadingBar

                if (res) {
                    toastr.success('Complaint deleted successfully')
                }
            }).catch(function (data, status) {
                toastr.error("Failed to delete complaint.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {}
                }); // showLoadingBar
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;  
            })
        }

        
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
                    var length = ctrl.complaintsList.length;

                    for (var i = 0; i < length; i++) {
                        if (ctrl.complaintsList[i].id === complaint.id) {
                            ctrl.complaintsList.splice(i, 1);
                            break;
                        }
                    }
                    toastr.success("Complaint deleted.");
                    ctrl.rerenderDataTable();
                    $rootScope.deleteComplaintModel.close();
                }).catch(function (data, status) {
                    toastr.error(data.data);
                    $rootScope.deleteComplaintModel.close();
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };
        };

    }
    angular.module('xenon.controllers').controller('ComplaintsController', ["$state", "$rootScope", "$stateParams", "$modal", "FormsDAO", "$debounce","$sce", "Page", ComplaintsController]);
})();
