(function() {
    function PayrollSettingsCtrl($rootScope, $scope, $http, $modal, $timeout) {
        var ctrl = this;
        ctrl.payrollObj = {};
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
// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            $(".ms-selection").find("span:contains('"+ctrl.newSelectedRate+"')").css("color","black");
            $rootScope.holidayRateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.holidayRateModal.holidayManually = true;
            
            $rootScope.holidayRateModal.save = function() {
                $timeout(function() {
                    if ($('#holiday_rate_form')[0].checkValidity()) {
                        if(!$rootScope.holidayRateModal.holidayManually){
                            $(".ms-selection").find("span:contains('"+ctrl.newSelectedRate+"')").css("color","red");
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
    }
    ;
    angular.module('xenon.controllers').controller('PayrollSettingsCtrl', ["$rootScope", "$scope", "$http", "$modal", "$timeout", PayrollSettingsCtrl]);
})();