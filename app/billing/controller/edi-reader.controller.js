/* global ontime_data, _, appHelper, parseFloat */

(function () {
    function EdiReaderCtrl(Page, InsurerDAO, BillingDAO) {
        var ctrl = this;
        ctrl.ediUploadData = {};
        Page.setTitle("EDI reader");
        ctrl.datatableObj = {};
        ctrl.limit = 10;
        ctrl.viewRecords = 10;
        var defaultSearchParams = {limit: 10, pageNo: 1, sortBy: 'id', order: 'desc'};
        ctrl.searchParams = angular.copy(defaultSearchParams);
        ctrl.criteriaSelected = false;
        ctrl.errorMsg = {};
        ctrl.insuranceProviderList = [];
        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.insuranceProviderList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        ctrl.reviewClaims = function (billingSessionId) {
            $state.go('app.billing_batch', {id: billingSessionId});
        };
        ctrl.pageChanged = function (pagenumber) {
            ctrl.searchParams.pageNo = pagenumber;
            ctrl.retrieveSessions();
        };
        ctrl.resetFilters = function () {
            ctrl.claims = [];
            ctrl.criteriaSelected = false;
            ctrl.searchParams = angular.copy(defaultSearchParams);
            $("#insuranceProviderId").select2("val", null);
        };
        ctrl.filterSessions = function () {
            ctrl.errorMsg = {};
            ctrl.searchParams.pageNo = 1;
            if (ctrl.searchParams.insuranceProviderId != null || ctrl.searchParams.batchId != null || ctrl.searchParams.fileName != null) {
                ctrl.criteriaSelected = true;
                ctrl.retrieveSessions();
            }
        };
        ctrl.retrieveSessions = function () {
            if (ctrl.criteriaSelected) {
                $rootScope.paginationLoading = true;
                $rootScope.maskLoading();
                ctrl.dataRetrieved = false;
                BillingDAO.searchClaims(ctrl.searchParams).then(function (res) {
                    ctrl.dataRetrieved = true;
                    ctrl.claims = res;
                }).catch(function (e) {
                    if (e.data != null) {
                        toastr.error(e.data);
                    } else {
                        toastr.error("Claims cannot be retrieved.");
                    }
                }).then(function () {
                    $rootScope.paginationLoading = false;
                    $rootScope.unmaskLoading();
                });
            }
        };

        ctrl.resetUploadData = function () {
            ctrl.ediUploadData = {};
            $("#insuranceProviderId1").select2("val", null);
        }

        ctrl.saveEdiUploadData = function () {
            if (ctrl.ediUploadData.insuranceProviderId == null) {
                ctrl.fileObj.errorMsg = "Please select insurance provider and then try again.";
            } else if (ctrl.ediUploadData.fileName == null) {
                ctrl.fileObj.errorMsg = "Please upload a text/835 file.";
            } else {
                BillingDAO.saveEdiSequence({sequenceId: ctrl.ediUploadData.sequenceId}).then(function () {
                    ctrl.resetUploadData();
                    toastr.success("EDI batch is created, search proposed reconciliation and start creating billing reconciliation.");
                }).catch(function(){
                    toastr.error("Error in saving EDI batch.");
                });
            }
        }

        ctrl.fileObj = {};

        // for file upload
        ctrl.uploadFile = {
            target: ontime_data.weburl + 'billing/edi/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                company_code: ontime_data.company_code,
                requestToken: getCookie('taken'),
                userName: getCookie('un')
            }
        };
        //When file is selected from browser file picker
        ctrl.fileSelected = function (file, flow) {
            ctrl.fileObj.flowObj = flow;
            ctrl.fileObj.selectedFile = file;
            ctrl.fileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.fileUploaded = function (response, file, flow) {
            ctrl.ediUploadData.fileName = file.name;
            if (response != null) {
                ctrl.ediUploadData.sequenceId = response;
            }
            ctrl.fileObj.flowObj.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
        };
        ctrl.fileError = function ($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
            ctrl.ediUploadData.fileName = null;
            ctrl.fileExt = "";
            ctrl.fileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.fileAdded = function (file, flow) { //It will allow all types of attachments'
            if (ctrl.ediUploadData.insuranceProviderId == null) {
                ctrl.fileObj.errorMsg = "Please select insurance provider and then try again.";
                return false;
            }
            ctrl.uploadFile.headers.insuranceProviderId = ctrl.ediUploadData.insuranceProviderId;
            if (file.getExtension() !== 'txt' && file.getExtension() !== '835') {
                ctrl.fileObj.errorMsg = "Please upload a valid text file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableUploadButton = true;
            ctrl.showfileProgress = true;
            ctrl.fileObj.errorMsg = null;
            ctrl.fileObj.flow = flow;
            ctrl.ediUploadData.fileName = file.name;
            ctrl.fileExt = "";
            ctrl.fileExt = file.getExtension();
            return true;
        };

    }
    angular.module('xenon.controllers')
            .controller('EdiReaderCtrl', ["Page", "InsurerDAO", "BillingDAO", EdiReaderCtrl])
})();
