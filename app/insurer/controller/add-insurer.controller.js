(function() {
    function AddInsurerCtrl($scope, $rootScope, $http, $modal, $timeout) {
        var ctrl = this;
        ctrl.insurerObj = {};
        ctrl.newSelectedType;

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

// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            $rootScope.careTypeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.careTypeModel.rate="unit";

            $rootScope.careTypeModel.save = function() {
                $timeout(function() {
                    if ($('#care_type_form')[0].checkValidity()) {
                        $rootScope.careTypeModel.dismiss();
                    }
                });
            };

            $rootScope.careTypeModel.cancel = function() {
                ctrl.insurerObj.careType.splice(ctrl.insurerObj.careType.indexOf(ctrl.newSelectedType), 1);
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                })
                $rootScope.careTypeModel.close();
            };

        };

        $scope.$watch(function() {
            return ctrl.insurerObj.careType;
        }, function(newValue, oldValue) {
            if (newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                ctrl.openModal('modal-5', 'md', false);
                if (oldValue == null) {
                    ctrl.newSelectedType = newValue;
                } else {
                    ctrl.newSelectedType = arr_diff(newValue, oldValue);
                }
            }
        });
    }
    ;
    angular.module('xenon.controllers').controller('AddInsurerCtrl', ["$scope", "$rootScope", "$http", "$modal", "$timeout", AddInsurerCtrl]);
})();