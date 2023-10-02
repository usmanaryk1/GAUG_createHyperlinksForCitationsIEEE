/* global ontime_data */
/* global _ */

(function () {
    function ApplicationCtrl($scope, $rootScope, $http, $state, Page, ApplicationDAO) {

        var ctrl = this;

        $rootScope.isLoginPage = true;
        $rootScope.isLightLoginPage = false;
        $rootScope.isLockscreenPage = false;
        $rootScope.isMainPage = false;

        $rootScope.stopIdle();
        ctrl.applicationData = {"orgCode": "AC1"}
//        ctrl.email = "";
//        ctrl.ssn = "";
//        ctrl.dateOfBirth = "";
        ctrl.currentDate = new Date();
        ctrl.maxBirthDate = new Date().setYear((ctrl.currentDate.getYear() + 1900) - 10);
        ctrl.ordCode = "AC1";

        ctrl.firstTime = null;

        ctrl.firstTimeApplication = function () {
            ctrl.firstTime = true;
            $state.go('applications.new');
            $("form#login").trigger('reset');
        };

        ctrl.existingApplication = function () {
            ctrl.firstTime = false;
            $state.go('applications.existing');
            $("form#login").trigger('reset');
        };
        
        ctrl.sendUserToApplication = function (applicationId){
            $state.go('applications-edit.details', {'id': applicationId});
        }

        ctrl.submitApplicationRetrieve = function () {
            if ($("form#login").valid()) {
                showLoadingBar(70); // Fill progress bar to 70% (just a given value)

                $rootScope.maskLoading();

                if (ctrl.firstTime === true) {
                    ApplicationDAO.saveApplication(ctrl.applicationData)
                            .catch(function (data, status) {
                                if (data.status || data.status === 409) {
                                    toastr.error(data.data);
                                } else {
                                    toastr.error("Application cannot be initiated.");
                                }
                            })
                            .then(function (data, status, headers, config) {
                                showLoadingBar({
                                    delay: .5,
                                    pct: 100,
                                    finish: function () {
                                        $rootScope.unmaskLoading();
                                    }
                                });
                                ctrl.sendUserToApplication(data.applicationId);
                            });
                } else {
                    ApplicationDAO.verifyExistingApplication(ctrl.applicationData)
                            .catch(function (data, status) {
                                toastr.error("Something went wrong, please contact administrator.");
                            })
                            .then(function (data) {
                                showLoadingBar({
                                    delay: .5,
                                    pct: 100,
                                    finish: function () {
                                        $rootScope.unmaskLoading();
                                    }
                                });
                                console.log(JSON.stringify(data))
                                if (data.applicationId == null || data.applicationId == '') {
                                    toastr.error("No application exists with these identification details.");
                                }
                                ctrl.sendUserToApplication(data.applicationId);
                            });
                }


            }
        };

        if ($state.current.name === 'applications.new') {
            ctrl.firstTime = true;
        } else if ($state.current.name === 'applications.existing') {
            ctrl.firstTime = false;
        }

    }
    ;
    angular.module('xenon.controllers').controller('ApplicationCtrl', ["$scope", "$rootScope", "$http", "$state", "Page", "ApplicationDAO", ApplicationCtrl]);
})();
