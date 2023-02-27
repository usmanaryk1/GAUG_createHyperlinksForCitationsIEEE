(function() {
    function AddInsurerCtrl($scope, $rootScope, $state, $modal, $timeout, InsurerDAO, CareTypeDAO) {
        var ctrl = this;
        ctrl.insurerObj = {insuranceCareTypeCollection: []};
        ctrl.selectedCareTypes = [];
        ctrl.fileObj = {};
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.initForm = function() {
            $("#add_inusrer_form input:text, #add_inusrer_form textarea").first().focus();
        };

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
            if (ctrl.insurerObj.contractFile == null) {
                ctrl.fileObj.errorMsg = "Please upload Contract File.";
            }
            if ($('#add_inusrer_form')[0].checkValidity() && ctrl.insurerObj.contractFile != null) {
                var insurerToSave = angular.copy(ctrl.insurerObj);
                var reqParam;
                if (ctrl.insurerObj.id && ctrl.insurerObj.id !== null) {
                    reqParam = 'update';
//                    delete insurerToSave.careTypes;
//                    if (ctrl.selectedCareTypes && ctrl.selectedCareTypes !== null) {
//                        insurerToSave.insuranceCareTypeCollection = [];
//                        for (var i = 0; i < ctrl.selectedCareTypes.length; i++) {
//                            insurerToSave.insuranceCareTypeCollection.push(Number(ctrl.selectedCareTypes[i]));
//                        }
//                    }
                } else {
                    reqParam = 'save';
                }
                if (insurerToSave.insuranceCareTypeCollection != null) {
                    angular.forEach(insurerToSave.insuranceCareTypeCollection, function(obj) {
                        delete obj.id;
                    })
                }
                insurerToSave.orgCode = ctrl.companyCode;
                if (insurerToSave.contractStartDate) {
                    insurerToSave.contractStartDate = new Date(insurerToSave.contractStartDate);
                }
                if (insurerToSave.contractEndDate) {
                    insurerToSave.contractEndDate = new Date(insurerToSave.contractEndDate);
                }
                InsurerDAO.update({action: reqParam, data: insurerToSave})
                        .then(function(res) {
                            console.log(res);
                            if (!ctrl.insurerObj.id || ctrl.insurerObj.id === null) {
                                $state.go('^.insurer', {id: res.id});
                                ctrl.editMode = true;
                                ctrl.insurerObj.id = res.id;
                            }
                            toastr.success("Insurance provider saved.");
                        })
                        .catch(function() {
                            //exception logic
                            toastr.error("Insurance provider cannot be saved.");
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
            CareTypeDAO.retrieveAll().then(function(res) {
                ctrl.careTypeList = res;
                ctrl.careTypeIdMap = {};
                angular.forEach(ctrl.careTypeList, function(obj) {
                    ctrl.careTypeIdMap[obj.id] = obj;
                });
                $timeout(function() {
                    $('#multi-select').multiSelect('refresh');
                });
            }).catch(function() {
                toastr.error("Failed to retrieve care type.");
                form_data = $('#add_patient_form').serialize();
            });
            if (ctrl.editMode) {
                ctrl.retrivalRunning = true;
                InsurerDAO.get({id: $state.params.id}).then(function(res) {
                    ctrl.insurerObj = res;

                    if (ctrl.insurerObj.insuranceCareTypeCollection == null) {
                        ctrl.insurerObj.insuranceCareTypeCollection = [];
                    } else {
                        angular.forEach(ctrl.insurerObj.insuranceCareTypeCollection, function(obj) {
                            ctrl.selectedCareTypes.push(obj.companyCaretypeId.id);
                        });
                    }
                    ctrl.retrivalRunning = false;
                }).catch(function(data, status) {
                    toastr.error("Failed to retrieve insurance provider.");
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {

                        }
                    }); // showLoadingBar
                    ctrl.insurerObj = ontimetest.insuranceProviders[($state.params.id - 1)];
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.insurerObj));
                    if (ctrl.insurerObj.insuranceCareTypeCollection == null) {
                        ctrl.insurerObj.insuranceCareTypeCollection = [];
                    } else {
                        ctrl.selectedCareTypes = ctrl.insurerObj.insuranceCareTypeCollection;
                    }
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
            $rootScope.careTypeModel.careTypeObj = {};
            $rootScope.careTypeModel.careTypeObj.unit = "unit";

            $rootScope.careTypeModel.save = function() {
                $timeout(function() {
                    if ($('#care_type_form')[0].checkValidity()) {
                        $rootScope.careTypeModel.dismiss();
//                        console.log(ctrl.selectedCareTypes);
                        $rootScope.careTypeModel.careTypeObj.companyCaretypeId = ctrl.careTypeIdMap[ctrl.newSelectedType];
                        ctrl.insurerObj.insuranceCareTypeCollection.push($rootScope.careTypeModel.careTypeObj);
                        if ($rootScope.careTypeModel.careTypeObj.modifiers != null) {
                            $rootScope.careTypeModel.careTypeObj.modifiers = JSON.stringify($rootScope.careTypeModel.careTypeObj.modifiers);
                        }
                        console.log(ctrl.insurerObj.insuranceCareTypeCollection);
                    }
                });
            };

            $rootScope.careTypeModel.cancel = function() {
                ctrl.selectedCareTypes.splice(ctrl.selectedCareTypes.indexOf(ctrl.newSelectedType), 1);
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                });
                $rootScope.careTypeModel.close();
            };

        };
        ctrl.pageInitCall();

        $scope.$watch(function() {
            return ctrl.selectedCareTypes;
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
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.fileSelected = function(file, flow) {
            ctrl.fileObj.flowObj = flow;
            ctrl.fileObj.selectedFile = file;
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
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
            ctrl.fileName = "";
            ctrl.fileExt = "";
            ctrl.insurerObj.contractFile = null;
            ctrl.fileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.fileAdded = function(file, flow) { //It will allow all types of attachments'
            ctrl.insurerObj.contractFile = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.fileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableUploadButton = true;
            ctrl.showfileProgress = true;
            ctrl.fileObj.errorMsg = null;
            ctrl.fileObj.flow = flow;
            ctrl.fileName = file.name;
            ctrl.fileExt = "";
            ctrl.fileExt = file.getExtension();
            return true;
        };
    }
    ;
    angular.module('xenon.controllers').controller('AddInsurerCtrl', ["$scope", "$rootScope", "$state", "$modal", "$timeout", "InsurerDAO", "CareTypeDAO", AddInsurerCtrl]);
})();