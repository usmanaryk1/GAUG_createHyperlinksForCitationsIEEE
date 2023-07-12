(function() {
    function PayrollSettingsCtrl($rootScope, $scope, $http, $modal, $timeout, PayrollDAO, $filter) {
        var ctrl = this;
        ctrl.payrollObj = {companyCode: ontimetest.company_code};
        ctrl.holidays = [{name: 'Christmas'}, {name: 'Columbus Day'}, {name: 'Independence Day'}, {name: 'Labor'}, {name: 'Memorial Day'}, {name: 'MLK Birthday'}, {name: 'New Year\'s Day'}, {name: 'Thanks giving Day'}, {name: 'Veterans Day'}, {name: 'Washington\'s Birthday'}];
        ctrl.initSettings = function() {
            $rootScope.maskLoading();
            ctrl.displayHolidayModal = false;
            PayrollDAO.getSettings().then(function(res) {
                if (res != null) {
                    ctrl.payrollObj = res;
                    ctrl.payrollObj.companyCode = ontimetest.company_code;
                    ctrl.retrievedHolidays = angular.copy(res.holidays);
                }
//                if (!ctrl.payrollObj.payrollFrequency || ctrl.payrollObj.payrollFrequency == null) {
//                    ctrl.payrollObj.payrollFrequency = '1W';
//                }
                $timeout(function() {
                    $('#multi-select').multiSelect('refresh');
                    ctrl.setHolidayManually();
                });
            }).catch(function() {
                toastr.error("Payroll settings cannot be retrieved.");
            }).then(function() {
                $rootScope.unmaskLoading();
            });
        };
        function arr_diff(a1, a2)
        {
            var a = [], diff = [];
            var diffArray = [];
            for (var i = 0; i < a1.length; i++)
                a[a1[i].name] = true;
            for (var i = 0; i < a2.length; i++)
                if (a[a2[i].name])
                    delete a[a2[i].name];
                else
                    a[a2[i].name] = true;
            for (var k in a)
                diff.push(k);
            for (var i = 0; i < a1.length; i++)
                if (diff.indexOf(a1[i].name) >= 0) {
                    diffArray.push(a1[i]);
                }
            return diffArray;
        }
        ;
        ctrl.saveSettings = saveSettings;
        function setFormDynamicValidityMessages() {
            $("#companyCode-error").text('Please enter Payroll Company Code.');
        }
        $scope.$watch(function() {
            return ctrl.payrollObj.payrollProvider;
        }, function(newVal, oldValue) {
            setValidationsForCompanyCode(newVal);
        });
        $scope.$watch(function() {
            return ctrl.payrollObj.payrollCompanyCode;
        }, function(newVal, oldValue) {
            if (newVal && (newVal === '' || newVal === null)) {
                setFormDynamicValidityMessages();
            }
        });
        function setValidationsForCompanyCode(payrollProvider) {
            if (payrollProvider && payrollProvider !== '' && payrollProvider != null) {
                $("input[name='companyCode']").attr('required', true);
            } else {
                $("input[name='companyCode']").attr('required', false);
            }
        }
        //function to save the payroll settings
        function saveSettings() {
            setFormDynamicValidityMessages();
            if ($('#payroll_settings_form')[0].checkValidity() && ctrl.payrollObj.holidays != null && ctrl.payrollObj.holidays.length > 0) {
                $rootScope.maskLoading();
                ctrl.payrollObj.holidays = angular.copy(ctrl.payrollObj.holidays);
                var holidaysToSave=angular.copy(ctrl.payrollObj.holidays);
                angular.forEach(holidaysToSave, function(holiday,index) {
                    console.log(holiday);
                    if (holiday.holidayDate == null) {
//                        ctrl.payrollObj.holidays[indexOfHoliday(holiday, ctrl.payrollObj.holidays)] = ctrl.retrievedHolidays[indexOfHoliday(holiday, ctrl.retrievedHolidays)];
                        holidaysToSave[index] = ctrl.retrievedHolidays[indexOfHoliday(holiday, ctrl.retrievedHolidays)];
                    }
                });
                ctrl.payrollObj.holidays=holidaysToSave;
                PayrollDAO.updateSettings(ctrl.payrollObj).then(function(res) {
                    ctrl.payrollObj = res;
                    ctrl.retrievedHolidays = angular.copy(res.holidays);
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
        ctrl.setHolidayManually = function() {
            if (ctrl.payrollObj.holidays != null && ctrl.payrollObj.holidays.length > 0) {
//                angular.forEach(ctrl.payrollObj.holidays, function(holiday) {
//                    if (holiday.holidayDate == null) {
//                        ctrl.payrollObj.holidays[indexOfHoliday(holiday, ctrl.payrollObj.holidays)] = ctrl.retrievedHolidays[indexOfHoliday(holiday, ctrl.retrievedHolidays)];
//                    }
//                });
//                $(".ms-selection").find("span").css("color", "black");
                angular.forEach(ctrl.payrollObj.holidays, function(holiday) {
                    if (holiday.isRepeatAnnually == false) {
                        $(".ms-selection").find("span:contains('" + holiday.name + "')").css("color", "red");
                    }
                });
            }
        };
// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            $rootScope.holidayRateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                keyboard: false,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $timeout(function() {
                $('#holidayDate').datepicker()
                        .on('changeDate', function(ev) {
                            $rootScope.holidayRateModal.holiday.holidayDate = $filter('date')(ev.date, $rootScope.dateFormat);
                        });
            }, 150);

            $rootScope.holidayRateModal.holiday = ctrl.newSelectedRate[0];
            $rootScope.holidayRateModal.holiday.isRepeatAnnually = true;
            $rootScope.holidayRateModal.holiday.holidayDate = $filter('date')(new Date(), $rootScope.dateFormat);
            $rootScope.holidayRateModal.save = function() {
                $timeout(function() {
                    if ($('#holiday_rate_form')[0].checkValidity()) {
                        $rootScope.holidayRateModal.dismiss();
                        if (ctrl.payrollObj.holidays == null) {
                            ctrl.payrollObj.holidays = [];
                        }
                        angular.forEach(ctrl.payrollObj.holidays, function(holiday) {
                            if (holiday.name == $rootScope.holidayRateModal.holiday.name) {
                                holiday = $rootScope.holidayRateModal.holiday;
                            }
                        });
                        ctrl.setHolidayManually();
                    }
                });
            };

            $rootScope.holidayRateModal.cancel = function() {
                ctrl.payrollObj.holidays.splice(indexOfHoliday(ctrl.newSelectedRate[0], ctrl.payrollObj.holidays), 1);
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                    ctrl.setHolidayManually();
                });
                $rootScope.holidayRateModal.close();
            };

        };

        var indexOfHoliday = function(holiday, holidays) {
            for (var i = 0; i < holidays.length; i++) {
                if (holidays[i].name == holiday.name) {
                    return i;
                }
            }
        };
        ctrl.resetPayroll = function() {
            delete ctrl.payrollObj.overtimeThreshhold;
            delete ctrl.payrollObj.vaccationRate;
            delete ctrl.payrollObj.sickRate;
            delete ctrl.payrollObj.personalRate;
            delete ctrl.payrollObj.holidays;
            $timeout(function() {
                $("#multi-select").multiSelect('refresh');
//                ctrl.setHolidayManually();
            });
        };

        $scope.$watch(function() {
            return ctrl.payrollObj.holidays;
        }, function(newValue, oldValue) {
            if (ctrl.displayHolidayModal && newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                if (oldValue == null) {
                    ctrl.newSelectedRate = newValue;
                } else {
                    ctrl.newSelectedRate = arr_diff(newValue, oldValue);
                }
                ctrl.newSelectedRate[0].isRepeatAnnually = true;
                ctrl.openModal('modal-5', 'md', false);
            }
        });
        ctrl.initSettings();
    }
    ;
    angular.module('xenon.controllers').controller('PayrollSettingsCtrl', ["$rootScope", "$scope", "$http", "$modal", "$timeout", "PayrollDAO", "$filter", PayrollSettingsCtrl]);
})();