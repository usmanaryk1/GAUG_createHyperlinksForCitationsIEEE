(function() {
    function AddInsurerCtrl($scope, $rootScope, $state, $modal, $timeout, InsurerDAO) {
        var ctrl = this;
        ctrl.insurerObj = {};
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
        } else {
            ctrl.editMode = false;
        }

        //funcions
        ctrl.saveInsurer = saveInsurerData;
        ctrl.pageInitCall = pageInit;


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

        //function to save insurer data.
        function saveInsurerData() {
            if ($('#add_inusrer_form')[0].checkValidity()) {
                var insurerToSave = angular.copy(ctrl.insurerObj);
                var reqParam;
                if (ctrl.insurerObj.id && ctrl.insurerObj.id !== null) {
                    reqParam = 'update';
                    delete insurerToSave.careTypes;
                    if (ctrl.insurerObj.careTypes && ctrl.insurerObj.careTypes !== null) {
                        insurerToSave.insuranceCareTypeCollection = [];
                        for (var i = 0; i < ctrl.insurerObj.careTypes.length; i++) {
                            insurerToSave.insuranceCareTypeCollection.push(Number(ctrl.insurerObj.careTypes[i]));
                        }
                    }
                } else {
                    reqParam = 'save';
                }

                InsurerDAO.update({action: reqParam, data: insurerToSave})
                        .then(function(res) {
                            if (!ctrl.insurerObj.id || ctrl.insurerObj.id === null) {
                                $state.go('^.insurer', {id: res.id});
                                ctrl.editMode = true;
                                ctrl.insurerObj.id = res.id;
                            }
                        })
                        .catch(function() {
                            //exception logic
                            console.log('Insurer Object : ' + JSON.stringify(insurerToSave));
                            if (!ctrl.insurerObj.id || ctrl.insurerObj.id === null) {
                                $state.go('^.insurer', {id: 1});
                                ctrl.editMode = true;
                                ctrl.insurerObj.id = 1;
                            }
                            
                        });

            }
        }
        
        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                ctrl.retrivalRunning = true;
                InsurerDAO.get({id: $state.params.id}).then(function(res) {
                    ctrl.insurerObj = res;
                    ctrl.retrivalRunning = false;
                }).catch(function(data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {

                        }
                    }); // showLoadingBar
                    ctrl.insurerObj = ontimetest.insuranceProviders[($state.params.id - 1)];
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.insurerObj));
                });
            }
        }

// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            $rootScope.careTypeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop
            });
            $rootScope.careTypeModel.rate = "unit";

            $rootScope.careTypeModel.save = function() {
                $timeout(function() {
                    if ($('#care_type_form')[0].checkValidity()) {
                        $rootScope.careTypeModel.dismiss();
                    }
                });
            };

            $rootScope.careTypeModel.cancel = function() {
                ctrl.insurerObj.careTypes.splice(ctrl.insurerObj.careTypes.indexOf(ctrl.newSelectedType), 1);
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                })
                $rootScope.careTypeModel.close();
            };

        };
        ctrl.pageInitCall();

        $scope.$watch(function() {
            return ctrl.insurerObj.careTypes;
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
    angular.module('xenon.controllers').controller('AddInsurerCtrl', ["$scope", "$rootScope", "$state", "$modal", "$timeout", "InsurerDAO", AddInsurerCtrl]);
})();