(function() {
    function PayrollSettingsCtrl($rootScope, $scope, $http, $modal, $timeout, PayrollDAO) {
        var ctrl = this;
        ctrl.payrollObj = {companyCode: ontimetest.company_code};
        ctrl.initSettings = function() {
            $rootScope.maskLoading();
            PayrollDAO.getSettings().then(function(res) {
                if (res != null) {
                    ctrl.payrollObj = res;
                    ctrl.payrollObj.companyCode = ontimetest.company_code;
                }
            }).catch(function() {
                toastr.error("Payroll settings cannot be retrieved.");
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };
        function arr_diff(a1, a2)
        {
            var a = [], diff = [];
            for (var i = 0; i < a1.length; i++)
                a[a1[i]] = true;
            for (var i = 0; i < a2.length; i++)
                if (a[a2[i]])
                    delete a[a2[i]];
                else
                    a[a2[i]] = true;
            for (var k in a)
                diff.push(k);
            return diff;
        }
        ;
        ctrl.saveSettings = saveSettings;
        //function to save the payroll settings
        function saveSettings() {
            if ($('#payroll_settings_form')[0].checkValidity()) {
                console.log(JSON.stringify(ctrl.payrollObj));
                $rootScope.maskLoading();
                PayrollDAO.updateSettings(ctrl.payrollObj).then(function(res) {
                    console.log(res);
                    toastr.success("Payroll settings saved.");
                }).catch(function() {
                    toastr.error("Payroll settings cannot be saved.");
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            }
        }
        ;
// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            $(".ms-selection").find("span:contains('" + ctrl.newSelectedRate + "')").css("color", "black");
            $rootScope.holidayRateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.holidayRateModal.holidayManually = true;

            $rootScope.holidayRateModal.save = function() {
                $timeout(function() {
                    if ($('#holiday_rate_form')[0].checkValidity()) {
                        if (!$rootScope.holidayRateModal.holidayManually) {
                            $(".ms-selection").find("span:contains('" + ctrl.newSelectedRate + "')").css("color", "red");
                        }
                        $rootScope.holidayRateModal.dismiss();
                    }
                });
            };

            $rootScope.holidayRateModal.cancel = function() {
                ctrl.payrollObj.holidayRate.splice(ctrl.payrollObj.holidayRate.indexOf(ctrl.newSelectedRate), 1);
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                })
                $rootScope.holidayRateModal.close();
            };

        };

        $scope.$watch(function() {
            return ctrl.payrollObj.holidayRate;
        }, function(newValue, oldValue) {
            if (newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                ctrl.openModal('modal-5', 'md', false);
                if (oldValue == null) {
                    ctrl.newSelectedRate = newValue;
                } else {
                    ctrl.newSelectedRate = arr_diff(newValue, oldValue);
                }
            }
        });
        ctrl.initSettings();
    }
    ;
    angular.module('xenon.controllers').controller('PayrollSettingsCtrl', ["$rootScope", "$scope", "$http", "$modal", "$timeout", "PayrollDAO", PayrollSettingsCtrl]);
})();