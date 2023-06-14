(function() {
    function AddInsurerCtrl($scope, $rootScope, $state, $modal, $timeout, InsurerDAO, CareTypeDAO) {
        var ctrl = this;
        ctrl.insurerObj = {insuranceCareTypeCollection: []};
        ctrl.selectedCareTypes = [];
        ctrl.fileObj = {};
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.planTypes = [{label: "Medicaid", value: "mcd"}, {label: "Medicare", value: "mcr"}, {label: "Tricare Champus", value: "tc"}, {label: "ChampVA", value: "cva"}, {label: "Group Healthplan", value: "gh"}, {label: "Feca Black Lung", value: "fbl"}, {label: "Blue Cross", value: "bc"}, {label: "Blue Shield", value: "bs"}, {label: "Blue Cross/Blue Sheild (BCBS)", value: "bcb"}, {label: "Other", value: "oth"}];
        ctrl.initForm = function() {
            $("#add_inusrer_form input:text, #add_inusrer_form textarea").first().focus();
        };
        ctrl.resetInsurer = function() {
            if (ctrl.insurerObj.contractFile != null) {
                ctrl.insurerObj.contractFile = null;
            }
            if (ctrl.fileObj.flowObj != null) {
                ctrl.fileObj.flowObj.cancel();
            }
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
        ctrl.newDeselectedType;
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
                    var length = ctrl.insurerObj.insuranceCareTypeCollection.length;
                    var finalCareTypeCollection = [];
                    for (var i = 0; i < length; i++) {
                        for (var j = 0; j < ctrl.selectedCareTypes.length; j++) {
                            if (ctrl.selectedCareTypes[j] === ctrl.insurerObj.insuranceCareTypeCollection[i].companyCaretypeId.id) {
                                finalCareTypeCollection.push(angular.copy(ctrl.insurerObj.insuranceCareTypeCollection[i]));
                                break;
                            }
                        }
                    }
//                    ctrl.insurerObj.insuranceCareTypeCollection = finalCareTypeCollection;
                    insurerToSave.insuranceCareTypeCollection = finalCareTypeCollection;
                } else {
                    reqParam = 'save';
                }
//                if (insurerToSave.insuranceCareTypeCollection != null) {
//                    angular.forEach(insurerToSave.insuranceCareTypeCollection, function(obj) {
//                        delete obj.id;
//                    })
//                }
                insurerToSave.orgCode = ctrl.companyCode;
//                if (insurerToSave.contractStartDate) {
//                    insurerToSave.contractStartDate = new Date(insurerToSave.contractStartDate);
//                }
//                if (insurerToSave.contractEndDate) {
//                    insurerToSave.contractEndDate = new Date(insurerToSave.contractEndDate);
//                }
                $rootScope.maskLoading();
                InsurerDAO.update({action: reqParam, data: insurerToSave})
                        .then(function(res) {
//                            if (!ctrl.insurerObj.id || ctrl.insurerObj.id === null) {
//                                $state.go('^.insurer', {id: res.id});
//                                ctrl.editMode = true;
//                            }
                            $state.go('app.insurer-list');
                            ctrl.insurerObj = res;
                            toastr.success("Insurance provider saved.");
                        }).catch(function() {
                    //exception logic
                    toastr.error("Insurance provider cannot be saved.");

                }).then(function() {
                    $rootScope.unmaskLoading();
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
                $rootScope.maskLoading();
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
                    console.log(JSON.stringify(ctrl.insurerObj));
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            }
        }

// Open Simple Modal
        ctrl.openModal = function(modal_id, modal_size, modal_backdrop)
        {
            ctrl.selecteModalOpen = true;
            $rootScope.careTypeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.careTypeModel.careTypeObj = {};
            $rootScope.careTypeModel.careTypeObj.unit = "unit";

            $rootScope.careTypeModel.save = function() {
                $timeout(function() {
                    if ($('#care_type_form')[0].checkValidity()) {
                        $rootScope.careTypeModel.dismiss();
                        $rootScope.careTypeModel.careTypeObj.companyCaretypeId = ctrl.careTypeIdMap[ctrl.newSelectedType];
                        ctrl.insurerObj.insuranceCareTypeCollection.push($rootScope.careTypeModel.careTypeObj);
                        if ($rootScope.careTypeModel.careTypeObj.modifiers != null) {
                            $rootScope.careTypeModel.careTypeObj.modifiers = JSON.stringify($rootScope.careTypeModel.careTypeObj.modifiers);
                        }
                    }
                    ctrl.selecteModalOpen = false;
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

        ctrl.openUnselectCareTypeModal = function(modal_id, modal_size, modal_backdrop)
        {
            ctrl.unselecteModalOpen = true;
            $rootScope.unselectCareTypeModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });

            $rootScope.unselectCareTypeModal.confirm = function() {
                $timeout(function() {
                    ctrl.unselecteModalOpen = false;
                    $rootScope.unselectCareTypeModal.dismiss();
                });
            };

            $rootScope.unselectCareTypeModal.cancelDelete = function() {
                ctrl.selectedCareTypes.push(Number(ctrl.newDeselectedType[0]));
                $timeout(function() {
                    $("#multi-select").multiSelect('refresh');
                });
                $rootScope.unselectCareTypeModal.close();
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
                if (!ctrl.unselecteModalOpen) {
                    ctrl.openModal('modal-5', 'md', 'static');
                    if (oldValue == null) {
                        ctrl.newSelectedType = newValue;
                    } else {
                        ctrl.newSelectedType = arr_diff(newValue, oldValue);
                    }
                } else {
                    ctrl.unselecteModalOpen = false;
                }
            } else if (oldValue !== null && newValue.length < oldValue.length) {
                if (!ctrl.selecteModalOpen) {
                    ctrl.newDeselectedType = arr_diff(oldValue, newValue);
                    ctrl.openUnselectCareTypeModal('modal-3', 'md', 'static');
                } else {
                    ctrl.selecteModalOpen = false;
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