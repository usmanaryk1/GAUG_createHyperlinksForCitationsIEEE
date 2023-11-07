/* global ontime_data */
/* global _ */

(function () {
    function RetrieveApplicationCtrl(ApplicationDataService, $rootScope, $stateParams, $state, Page, ApplicationPublicDAO, JobPostPublicDAO) {
        var ctrl = this;

        ctrl.companyName;
        ApplicationDataService.setBaseValues();

        $rootScope.stopIdle();
        ctrl.applicationData = {},
        ctrl.firstTime = false;

        ctrl.sendUserToApplication = function (applicationId) {
            $state.go('applications-edit.tab1', {'id': applicationId});
        }

        ctrl.submitApplicationRetrieve = function () {
            if ($("form#login").valid()) {
                showLoadingBar(70); // Fill progress bar to 70% (just a given value)
//                $rootScope.maskLoading();
                ctrl.applicationSubmitted = true;
                if (ctrl.firstTime !== true) {
                    ApplicationPublicDAO.startApplication(ctrl.applicationData)
                            .then(function (data, status, headers, config) {
                                ctrl.applicationSubmitted = true;
                            }).catch(function (data, status) {
                        if (data.status || data.status === 409) {
                            toastr.error(data.data);
                        } else {
                            toastr.error("Application cannot be initiated.");
                        }
                    }).then(function () {
                        showLoadingBar({
                            delay: .5,
                            pct: 100,
                            finish: function () {
                                $rootScope.unmaskLoading();
                            }
                        });
                    });
                }
            }
        }
        
        if ($state.params.posting_identifier == null || $state.params.resource_identifier == null) {
        } else {
            $rootScope.maskLoading();
            var requestBody = {'action': $state.params.posting_identifier, 'subAction': $state.params.resource_identifier};
            JobPostPublicDAO.retrieveJobPost(requestBody)
                    .then(function (data) {
                        ctrl.companyName = data.companyName;
                        ctrl.applicationData.orgCode = data.orgCode;
                        ctrl.postTitle = data.postTitle;
                        ctrl.applicationData.postingIdentifier = data.postingIdentifier;
                        ctrl.applicationData.sourceIdentifier = $state.params.resource_identifier;
                    })
                    .catch(function (data, status) {
                        if (data.status || data.status === 400) {
                            toastr.error(data.data);
                        } else {
                            toastr.error("Application cannot be initiated.");
                        }
                    })
                    .then(function () {
                        $rootScope.unmaskLoading();
                    });
        }
    }

    angular.module('xenon.controllers').controller('RetrieveApplicationCtrl', ["ApplicationDataService", "$rootScope", "$stateParams", "$state", "Page", "ApplicationPublicDAO", "JobPostPublicDAO", RetrieveApplicationCtrl]);
})();
