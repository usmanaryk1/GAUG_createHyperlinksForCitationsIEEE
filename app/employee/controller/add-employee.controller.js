(function() {
    function AddEmployeeCtrl($scope, CareTypeDAO, $state, EmployeeDAO, $timeout, $formService, $rootScope) {
        var ctrl = this;
        ctrl.retrivalRunning = true;
        ctrl.currentDate = new Date();
        ctrl.employee = {employeeDocumentId: {}};
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.fromNext = false;
        ctrl.setFromNext = function(fromNext) {
            ctrl.fromNext = fromNext;
        }
        ctrl.careTypeList = [];
        ctrl.applicationFileObj = {};
        ctrl.i9eligibilityFileObj = {};
        ctrl.w4FileObj = {};
        ctrl.referencesFileObj = {};
        ctrl.physicalFileObj = {};
        ctrl.profileFileObj = {};
        ctrl.resetEmployeeTab3 = function() {
            ctrl.applicationFileObj.errorMsg = null;
            ctrl.i9eligibilityFileObj.errorMsg = null;
            ctrl.w4FileObj.errorMsg = null;
            if (ctrl.employee.employeeDocumentId.application != null) {
                ctrl.employee.employeeDocumentId.application = null;
            }
            if (ctrl.employee.employeeDocumentId.i9 != null) {
                ctrl.employee.employeeDocumentId.i9 = null;
            }
            if (ctrl.employee.employeeDocumentId.w4 != null) {
                ctrl.employee.employeeDocumentId.w4 = null;
            }
            if (ctrl.employee.employeeDocumentId.references != null) {
                ctrl.employee.employeeDocumentId.references = null;
            }
            if (ctrl.employee.employeeDocumentId.physical != null) {
                ctrl.employee.employeeDocumentId.physical = null;
            }

            if (ctrl.applicationFileObj.flowObj != null) {
                ctrl.applicationFileObj.flowObj.cancel();
            }
            if (ctrl.i9eligibilityFileObj.flowObj != null) {
                ctrl.i9eligibilityFileObj.flowObj.cancel();
            }
            if (ctrl.w4FileObj.flowObj != null) {
                ctrl.w4FileObj.flowObj.cancel();
            }
            if (ctrl.referencesFileObj.flowObj != null) {
                ctrl.referencesFileObj.flowObj.cancel();
            }
            if (ctrl.physicalFileObj.flowObj != null) {
                ctrl.physicalFileObj.flowObj.cancel();
            }
            $scope.resetForm = true;
        };

        ctrl.resetEmployeeTab1 = function() {
            ctrl.profileFileObj.errorMsg = null;
            if (ctrl.employee.profileImage !== null) {
                ctrl.employee.profileImage = null;
            }
            if (ctrl.profileFileObj.flowObj && ctrl.profileFileObj.flowObj !== null) {
                ctrl.profileFileObj.flowObj.cancel();
            }
            $scope.resetForm = true;
        };

        ctrl.resetEmployeeTab2 = function() {
            ctrl.employee.taxStatus = 'W';
            ctrl.employee.wages = 'H';
            ctrl.employee.careRatesList = {rate1: {careTypes: []}, rate2: {careTypes: []}};

            $timeout(function() {
                $("#rate2").multiSelect('refresh');
                $("#rate1").multiSelect('refresh');
            }, 100);
            $scope.resetForm = true;
        };

        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
        } else if ($state.current.name.indexOf('tab1') > -1) {
            ctrl.employee = {}
            ctrl.editMode = false;
        } else {
            $state.transitionTo(ontimetest.defaultState);
        }


        ctrl.saveEmployee = saveEmployeeData;
        ctrl.pageInitCall = pageInit;
        var form_data;

        ctrl.checkFileUploadValidity = function() {
            var validApplication = true;
            var validI9Eligibility = true;
            var validW4 = true;
            if ($rootScope.tabNo != 3) {
                ctrl.applicationFileObj.errorMsg = null;
                ctrl.i9eligibilityFileObj.errorMsg = null;
                ctrl.w4FileObj.errorMsg = null;
            }

            if ($rootScope.tabNo == 3 && ctrl.employee.employeeDocumentId.application == null && (ctrl.formDirty || ctrl.formSubmitted)) {
                ctrl.applicationFileObj.errorMsg = "Please upload Application.";
                validApplication = false;
            }
            if ($rootScope.tabNo == 3 && ctrl.employee.employeeDocumentId.i9 == null && (ctrl.formDirty || ctrl.formSubmitted)) {
                ctrl.i9eligibilityFileObj.errorMsg = "Please upload I-9 Eligibility.";
                validI9Eligibility = false;
            }
            if ($rootScope.tabNo == 3 && ctrl.employee.employeeDocumentId.w4 == null && (ctrl.formDirty || ctrl.formSubmitted)) {
                ctrl.w4FileObj.errorMsg = "Please upload W-4 or I9.";
                validW4 = false;
            }
            return (validApplication && validI9Eligibility && validW4);
        };

        //ceck if form has been changed or not
        //If changed then it should be valid
        ctrl.navigateToTab = function(event, state) {
            $scope.resetForm = false;
            if ($('#add_employee_form').serialize() !== form_data) {
                ctrl.formDirty = true;
            }
            var fileUploadValid = ctrl.checkFileUploadValidity();
            if (($('#add_employee_form').valid() && fileUploadValid) || !ctrl.formDirty) {
                if (ctrl.editMode) {
                    $state.go('^.' + state, {id: $state.params.id});
                }
            }
            event.stopPropagation();
        };

        //function to save the employee data
        function saveEmployeeData() {
            $scope.resetForm = false;
            ctrl.formSubmitted = true;
            setFormDynamicValidityMessages();
            var fileUploadValid = ctrl.checkFileUploadValidity();
            var employeeToSave = angular.copy(ctrl.employee);
            employeeToSave.phone = employeeToSave.phone.toString();
            if (!ctrl.employee.employeeDocumentId.application || ctrl.employee.employeeDocumentId.application === null) {
                delete employeeToSave.employeeDocumentId;
            } else {
                if (employeeToSave.employeeDocumentId.physicalExpirationDate) {
                    employeeToSave.employeeDocumentId.physicalExpirationDate = new Date(employeeToSave.employeeDocumentId.physicalExpirationDate);
                }
                if (employeeToSave.employeeDocumentId.licenceExpirationDate) {
                    employeeToSave.employeeDocumentId.licenceExpirationDate = new Date(employeeToSave.employeeDocumentId.licenceExpirationDate);
                }
                if (employeeToSave.employeeDocumentId.i9ExpirationDate) {
                    employeeToSave.employeeDocumentId.i9ExpirationDate = new Date(employeeToSave.employeeDocumentId.i9ExpirationDate);
                }
                if (employeeToSave.employeeDocumentId.tbTestingExpirationDate) {
                    employeeToSave.employeeDocumentId.tbTestingExpirationDate = new Date(employeeToSave.employeeDocumentId.tbTestingExpirationDate);
                }
                if (employeeToSave.employeeDocumentId.startDate) {
                    employeeToSave.employeeDocumentId.startDate = new Date(employeeToSave.employeeDocumentId.startDate);
                }
                if (employeeToSave.employeeDocumentId.endDate) {
                    employeeToSave.employeeDocumentId.endDate = new Date(employeeToSave.employeeDocumentId.endDate);
                }
            }
            delete employeeToSave.careRatesList;
            delete employeeToSave.employeeCareRatesList;
            if (employeeToSave.dateOfBirth) {
                employeeToSave.dateOfBirth = new Date(employeeToSave.dateOfBirth);
            }

            if ($('#add_employee_form')[0].checkValidity() && fileUploadValid) {
                var reqParam;
                if (ctrl.employee.id && ctrl.employee.id !== null) {
                    reqParam = 'updateemployee';
                    if (ctrl.employee.careRatesList && ctrl.employee.careRatesList !== null) {
                        var careRateList = angular.copy(ctrl.employee.careRatesList);
                        careRateList.employeeId = ctrl.employee.id;
                        EmployeeDAO.updateCareRates(careRateList)
                                .then(function() {
                                    updateEmployee(reqParam, employeeToSave);
                                })
                                .catch(function() {
                                    console.log(JSON.stringify(careRateList));
                                });
                    } else {
                        updateEmployee(reqParam, employeeToSave);
                    }
                } else {
                    employeeToSave.orgCode = ontimetest.company_code;
                    ctrl.employee.orgCode = ontimetest.company_code;
                    reqParam = 'saveemployee';
                    updateEmployee(reqParam, employeeToSave);
                }
            }
        }

        function updateEmployee(reqParam, employeeToSave) {
//            if (employeeToSave.employeeDocumentId.physicalExpirationDate) {
//                employeeToSave.employeeDocumentId.physicalExpirationDate = new Date(employeeToSave.employeeDocumentId.physicalExpirationDate);
//            }
//            if (employeeToSave.employeeDocumentId.licenceExpirationDate) {
//                employeeToSave.employeeDocumentId.licenceExpirationDate = new Date(employeeToSave.employeeDocumentId.licenceExpirationDate);
//            }
//            if (employeeToSave.employeeDocumentId.i9ExpirationDate) {
//                employeeToSave.employeeDocumentId.i9ExpirationDate = new Date(employeeToSave.employeeDocumentId.i9ExpirationDate);
//            }
//            if (employeeToSave.employeeDocumentId.tbTestingExpirationDate) {
//                employeeToSave.employeeDocumentId.tbTestingExpirationDate = new Date(employeeToSave.employeeDocumentId.tbTestingExpirationDate);
//            }
//            if (employeeToSave.employeeDocumentId.startDate) {
//                employeeToSave.employeeDocumentId.startDate = new Date(employeeToSave.employeeDocumentId.startDate);
//            }
//            if (employeeToSave.employeeDocumentId.endDate) {
//                employeeToSave.employeeDocumentId.endDate = new Date(employeeToSave.employeeDocumentId.endDate);
//            }
            $rootScope.maskLoading();
            EmployeeDAO.update({action: reqParam, data: employeeToSave})
                    .then(function(res) {
                        if (!ctrl.employee.id || ctrl.employee.id === null) {
                            ctrl.editMode = true;
                            if (ctrl.fromNext) {
                                $state.go('^.tab2', {id: res.id});
                            } else {
                                $state.go('^.tab1', {id: res.id});
                                ctrl.editMode = true;
                            }
                        }
                        if ($rootScope.tabNo == 3) {
                            $state.go('app.employee-list', {status: "active"});
                        }
                        toastr.success("Employee saved.");
                        ctrl.employee = res;
                        EmployeeDAO.retrieveEmployeeCareRates({employee_id: ctrl.employee.id}).then(function(res) {
                            ctrl.employee.careRatesList = res;
                            $timeout(function() {
                                $("#rate2").multiSelect('refresh');
                                $("#rate1").multiSelect('refresh');
                            }, 200);
                        });
                        ctrl.formSubmitted = false;
                    })
                    .catch(function() {
                        toastr.error("Employee cannot be saved.");
                        ctrl.formSubmitted = false;
                        //exception logic
                        console.log('Employee2 Object : ' + JSON.stringify(ctrl.employee));
                    }).then(function() {
                $rootScope.unmaskLoading();
            });
        }

        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                $rootScope.maskLoading();
                EmployeeDAO.get({id: $state.params.id}).then(function(res) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {
                        }
                    }); // showLoadingBar
                    if (res.profileImage != null && res.profileImage != '') {
                        ctrl.hideLoadingImage = false;
                    } else {
                        ctrl.hideLoadingImage = true;
                    }
                    ctrl.employee = res;
                    ctrl.retrivalRunning = false;
                    EmployeeDAO.retrieveEmployeeCareRates({employee_id: ctrl.employee.id}).then(function(res) {
                        ctrl.employee.careRatesList = res;
                        $timeout(function() {
                            $("#rate2").multiSelect('refresh');
                            $("#rate1").multiSelect('refresh');
                        }, 200);
                        ctrl.retrivalRunning = false;
                    }).catch(function() {
                        toastr.error("Failed to retrieve employee care rates.");
                    });
                }).catch(function(data, status) {
                    toastr.error("Failed to retrieve employee.");
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.employee))
                }).then(function() {
                    $rootScope.unmaskLoading();
                });
            } else {
                ctrl.retrivalRunning = false;
            }
        }
        ;


//        These needs to be done for dynamic validations. It creates issue because of data-validate directive which applies to static form only
        function setFormDynamicValidityMessages() {
            $("#Salary-error").text('Please enter Salary.');
            $("#rate1-error").text('Please select Care Types.');
            $("#Rate1-error").text('Please enter Rate 1.');
            $("#OTRate-error").text('Please enter OT Rate.');
            $("#HDRate-error").text('Please enter HD Rate.');
            $("#TBTestingExpirationDate-error").text('Please enter TB Testing Expiration Date.');
            $("#PhysicalExpirationDate-error").text('Please enter Physical Expiration Date.');
        }

        $scope.$watch(function() {
            if (!ctrl.employee.employeeDocumentId) {
                ctrl.employee.employeeDocumentId = {};
            }
            return ctrl.employee.employeeDocumentId.physical;
        }, function(newVal, oldValue) {
            if (newVal && newVal !== '') {
                $("input[name='PhysicalExpirationDate']").attr('required', true);
            } else {
                $("input[name='PhysicalExpirationDate']").attr('required', false);
            }
        });

        $scope.$watch(function() {
            if (!ctrl.employee.employeeDocumentId) {
                ctrl.employee.employeeDocumentId = {};
            }
            return ctrl.employee.employeeDocumentId.tbTesting;
        }, function(newVal, oldValue) {
            if (newVal && newVal !== '') {
                $("input[name='TBTestingExpirationDate']").attr('required', true);
            } else {
                $("input[name='TBTestingExpirationDate']").attr('required', false);
            }
        });

        $scope.$watch(function() {
            return ctrl.employee.wages;
        }, function(newVal, oldValue) {
            setValidationsForTab2(newVal);
        });

        function setValidationsForTab2(wages) {
            if (wages && wages === 'S') {
                $("input[name='Salary']").attr('required', true);
                $("input[name='rate1']").attr('required', false);
                $("input[name='Rate1']").attr('required', false);
                $("input[name='OTRate']").attr('required', false);
                $("input[name='HDRate']").attr('required', false);
            } else {
                $("input[name='Salary']").attr('required', false);
                $("input[name='rate1']").attr('required', true);
                $("input[name='Rate1']").attr('required', true);
                $("input[name='OTRate']").attr('required', true);
                $("input[name='HDRate']").attr('required', true);
            }
        }

        ctrl.tab3DataInit = function() {
            ctrl.formDirty = false;
            $("#add_employee_form input:text, #add_employee_form textarea #add_employee_form select").first().focus();
            $timeout(function() {
                if (!ctrl.employee.employeeDocumentId || ctrl.employee.employeeDocumentId === null) {
                    ctrl.employee.employeeDocumentId = {};
                }
                if (!ctrl.retrivalRunning) {
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab3DataInit();
                }
            }, 100);

        };

        ctrl.tab2DataInit = function() {
            ctrl.formDirty = false;
            $("#add_employee_form input:text, #add_employee_form textarea #add_employee_form select").first().focus();
            //to set radio buttons on tab init..
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    CareTypeDAO.retrieveAll({position: ctrl.employee.position}).then(function(res) {
                        ctrl.careTypeList = res;
                        $timeout(function() {
                            $('#rate1').multiSelect('refresh');
                            $('#rate2').multiSelect('refresh');
                            form_data = $('#add_employee_form').serialize();
                        }, 200);
                    }).catch(function() {
                        toastr.error("Failed to retrieve care types.");
                        form_data = $('#add_employee_form').serialize();
                    });
                    if (!ctrl.employee.taxStatus || ctrl.employee.taxStatus === null) {
                        ctrl.employee.taxStatus = 'W';
                    }
                    if (!ctrl.employee.wages || ctrl.employee.wages === null) {
                        ctrl.employee.wages = 'H';
                    }
                    setValidationsForTab2(ctrl.employee.wages);
                    $formService.setRadioValues('TaxStatus', ctrl.employee.taxStatus);
                    $formService.setRadioValues('Wages', ctrl.employee.wages);
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab2DataInit();
                }
            }, 300);

        };
        ctrl.tab1DataInit = function() {
            ctrl.formDirty = false;
            $("#add_employee_form input:text, #add_employee_form textarea #add_employee_form select").first().focus();
            //to set edit mode in tab change
            if (!$state.params.id || $state.params.id === '') {
                ctrl.editMode = false;
                ctrl.employee = {};
            } else {
                ctrl.editMode = true;
            }
            //to set radio buttons on tab init..
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    if (!ctrl.employee.position || ctrl.employee.position === null) {
                        ctrl.employee.position = 'pc';
                    }
                    $formService.setRadioValues('Position', ctrl.employee.position);
                    form_data = $('#add_employee_form').serialize();
                } else {
                    ctrl.tab1DataInit();
                }
            }, 100);

        };

        ctrl.applicationUploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "a",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.applicationFileSelected = function(file, flow) {
            ctrl.applicationFileObj.flowObj = flow;
            ctrl.applicationFileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.applicationFileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.employeeDocumentId.application = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableApplicationUploadButton = false;
        };
        ctrl.applicationFileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableApplicationUploadButton = false;
            ctrl.employee.employeeDocumentId.application = null;
            ctrl.applicationFileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.applicationFileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.employeeDocumentId.application = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.applicationFileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableApplicationUploadButton = true;
            ctrl.applicationShowfileProgress = true;
            ctrl.applicationFileObj.errorMsg = null;
            ctrl.applicationFileObj.flow = flow;
            return true;
        };

        ctrl.i9eligibilityUploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "9",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.i9eligibilityFileSelected = function(file, flow) {
            ctrl.i9eligibilityFileObj.flowObj = flow;
            ctrl.i9eligibilityFileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.i9eligibilityFileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.employeeDocumentId.i9 = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableW4UploadButton = false;
        };
        ctrl.i9eligibilityFileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableW4UploadButton = false;
            ctrl.employee.employeeDocumentId.i9 = null;
            ctrl.i9eligibilityFileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.i9eligibilityFileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.employeeDocumentId.i9 = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.i9eligibilityFileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableW4UploadButton = true;
            ctrl.i9eligibilityShowfileProgress = true;
            ctrl.i9eligibilityFileObj.errorMsg = null;
            ctrl.i9eligibilityFileObj.flow = flow;
            return true;
        };

        ctrl.w4UploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "w",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.w4FileSelected = function(file, flow) {
            ctrl.w4FileObj.flowObj = flow;
            ctrl.w4FileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.w4FileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.employeeDocumentId.w4 = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableW4UploadButton = false;
        };
        ctrl.w4FileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableW4UploadButton = false;
            ctrl.employee.employeeDocumentId.w4 = null;
            ctrl.w4FileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.w4FileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.employeeDocumentId.w4 = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.w4FileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableW4UploadButton = true;
            ctrl.w4ShowfileProgress = true;
            ctrl.w4FileObj.errorMsg = null;
            ctrl.w4FileObj.flow = flow;
            return true;
        };

        ctrl.referencesUploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "r",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.referencesFileSelected = function(file, flow) {
            ctrl.referencesFileObj.flowObj = flow;
            ctrl.referencesFileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.referencesFileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.employeeDocumentId.references = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableReferencesUploadButton = false;
        };
        ctrl.referencesFileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableReferencesUploadButton = false;
            ctrl.employee.employeeDocumentId.references = null;
            ctrl.referencesFileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.referencesFileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.employeeDocumentId.references = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.referencesFileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableReferencesUploadButton = true;
            ctrl.referencesShowfileProgress = true;
            ctrl.referencesFileObj.errorMsg = null;
            ctrl.referencesFileObj.flow = flow;
            return true;
        };

        ctrl.physicalUploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "z",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.physicalFileSelected = function(file, flow) {
            ctrl.physicalFileObj.flowObj = flow;
            ctrl.physicalFileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.physicalFileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.employeeDocumentId.physical = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disablePhysicalUploadButton = false;
        };
        ctrl.physicalFileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disablePhysicalUploadButton = false;
            ctrl.employee.employeeDocumentId.physical = null;
            ctrl.physicalFileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.physicalFileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.employeeDocumentId.physical = null;
            if ($rootScope.validFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.physicalFileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disablePhysicalUploadButton = true;
            ctrl.physicalShowfileProgress = true;
            ctrl.physicalFileObj.errorMsg = null;
            ctrl.physicalFileObj.flow = flow;
            return true;
        };

        ctrl.profileUploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "a",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.profileFileSelected = function(file, flow) {
            ctrl.profileFileObj.flowObj = flow;
            ctrl.profileFileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.profileFileUploaded = function(response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.employee.profileImage = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableProfileUploadButton = false;
            ctrl.hideLoadingImage = false;
        };
        ctrl.profileFileError = function($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableProfileUploadButton = false;
            ctrl.employee.profileImage = null;
            ctrl.profileFileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.profileFileAdded = function(file, flow) { //It will allow all types of attahcments'
            ctrl.formDirty = true;
            ctrl.employee.profileImage = null;
            if ($rootScope.validImageFileTypes.indexOf(file.getExtension()) < 0) {
                ctrl.profileFileObj.errorMsg = "Please upload a valid file.";
                return false;
            }
            ctrl.disableSaveButton = true;
            ctrl.disableProfileUploadButton = true;
            ctrl.profileShowfileProgress = true;
            ctrl.profileFileObj.errorMsg = null;
            ctrl.profileFileObj.flow = flow;
            return true;
        };



//        $scope.$watch(function() {
//            return ctrl.employee.position;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('Position', newVal);
//        });
//        $scope.$watch(function() {
//            return ctrl.employee.Wages;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('Wages', newVal);
//        });
//        $scope.$watch(function() {
//            return ctrl.employee.TaxStatus;
//        }, function(newVal, oldValue) {
//            $formService.setRadioValues('TaxStatus', newVal);
//        });

//        ctrl.pageInitCall();
    }
    ;
    angular.module('xenon.controllers').controller('AddEmployeeCtrl', ["$scope", "CareTypeDAO", "$state", "EmployeeDAO", "$timeout", "$formService", "$rootScope", AddEmployeeCtrl]);
})();
