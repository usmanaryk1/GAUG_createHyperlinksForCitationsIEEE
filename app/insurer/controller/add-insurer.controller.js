(function() {
    function AddInsurerCtrl($scope, $rootScope, $state, $modal, $timeout, InsurerDAO) {
        var ctrl = this;
        ctrl.insurerObj = {};
        ctrl.fileObj = {};
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
            ctrl.displayCareTypeModal = false;

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
                });
                $rootScope.careTypeModel.close();
            };

        };
        ctrl.pageInitCall();

        $scope.$watch(function() {
            return ctrl.insurerObj.careTypes;
        }, function(newValue, oldValue) {
            $timeout(function() {
                $("#multi-select").multiSelect('refresh');
            });
            if (ctrl.displayCareTypeModal && newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                ctrl.openModal('modal-5', 'md', false);
                if (oldValue == null) {
                    ctrl.newSelectedType = newValue;
                } else {
                    ctrl.newSelectedType = arr_diff(newValue, oldValue);
                }
            }
        }, true);
        ctrl.uploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "i",
                company_code: "elance"
            }
        };
        //When file is selected from browser file picker
        ctrl.fileSelected = function(file, flow) {
            ctrl.fileObj.flowObj = flow;
            ctrl.fileObj.selectedFile = file;
            ctrl.disableSaveButton = true;
            ctrl.disableUploadButton = true;
            ctrl.showfileProgress = true;
            ctrl.fileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.fileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.insurerObj.contractFile = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
        };
        ctrl.fileError = function($file, $message, $flow) {
            console.log("File cannot be uploaded");
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
            ctrl.fileName = "";
            ctrl.fileExt = "";
            ctrl.fileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.fileAdded = function(file, flow) { //It will allow all types of attachments
            ctrl.fileObj.errorMsg = null;
            ctrl.fileObj.flow = flow;
            ctrl.fileName = file.name;
            ctrl.fileExt = "";
            ctrl.fileExt = file.getExtension();
            return true;
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddInsurerCtrl', ["$scope", "$rootScope", "$state", "$modal", "$timeout", "InsurerDAO", AddInsurerCtrl]);
})();