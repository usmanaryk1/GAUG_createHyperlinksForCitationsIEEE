(function () {
    function AddPatientCtrl($formService, $state, PatientDAO, $timeout, $scope, $rootScope, CareTypeDAO, EmployeeDAO, InsurerDAO, Page, $modal) {
        var ctrl = this;
        ctrl.currentDate = new Date();
        ctrl.maxBirthDate = new Date().setYear((ctrl.currentDate.getYear() + 1900) - 10);
        ctrl.retrivalRunning = true;
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.languagesKeyValue = [{key: "English"}, {key: "Creole"}, {key: "Spanish"}, {key: "Russian"}, {key: "French"}, {key: "Hindi"}, {key: "Bengali"}, {key: "Mandarin"}, {key: "Korean"}, {key: "Arabic"}, {key: "Farsi"}, {key: "Urdu"}];
        ctrl.nextTab;
        ctrl.fileObj = {};
//        ctrl.formDirty = false;
        ctrl.patient = {};
        ctrl.careTypes = [];
        ctrl.patientCareTypeMap = {};
        ctrl.careTypeIdMap = {};
        ctrl.unselecteModalOpen = false;
        ctrl.refreshLanguages = function () {
            $timeout(function () {
                $('#languageOtherText').tagsinput("add", ctrl.patient.otherLanguages);
            });
        };
        ctrl.nursingCareList = [];
        ctrl.staffCoordinatorList = [];
        ctrl.insuranceProviderList = [];
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            Page.setTitle("Update Patient");
            ctrl.editMode = true;
        } else if ($state.current.name.indexOf('tab1') > -1) {
            Page.setTitle("Add Patient");
            ctrl.editMode = false;
        } else {
            $state.transitionTo(ontimetest.defaultState);
        }
        var form_data;
        EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.NURSING_CARE_COORDINATOR}).then(function (res) {
            ctrl.nursingCareList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve nursing care list.");
        });
        EmployeeDAO.retrieveByPosition({'position': ontimetest.positionGroups.STAFFING_COORDINATOR}).then(function (res) {
            ctrl.staffCoordinatorList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve staff coordinator list.");
        });
        InsurerDAO.retrieveAll().then(function (res) {
            ctrl.insuranceProviderList = res;
        }).catch(function () {
            toastr.error("Failed to retrieve insurance provider list.");
        });
        //funcions
        ctrl.savePatient = savePatientData;
        ctrl.pageInitCall = pageInit;
        ctrl.tab1DataInit = tab1DataInit;
        ctrl.tab2DataInit = tab2DataInit;
        ctrl.tab3DataInit = tab3DataInit;
        ctrl.tab4DataInit = tab4DataInit;
        ctrl.tab5DataInit = tab5DataInit;
        ctrl.navigateToTab = navigateToTab;
        ctrl.setBillingAddress = setBillingAddress;
        ctrl.setBillingAddressRadioButton = setBillingAddressRadioButton;
        ctrl.resetPatient = function () {
            if (ctrl.patient.authorization != null) {
                ctrl.patient.authorization = null;
            }
            if (ctrl.fileObj.flowObj != null) {
                ctrl.fileObj.flowObj.cancel();
            }
        };
        ctrl.setFromNext = function (tab) {
            ctrl.nextTab = tab;
        }
        ctrl.isValidAutorization = function (formValidity) {
            var validAuthorization = true;
            if ($rootScope.tabNo == 4 && ctrl.patient.authorization == null && formValidity) {
                ctrl.fileObj.errorMsg = "Please upload Authorization Document.";
                validAuthorization = false;
            } else {
                ctrl.fileObj.errorMsg = "";
            }
            return validAuthorization;
        };

        //ceck if form has been changed or not
        //If changed then it should be valid
        //function to navigate to different tab by state
        function navigateToTab(event, state) {
            // Don't propogate the event to the document
            if ($('#add_patient_form').serialize() !== form_data) {
                ctrl.formDirty = true;
            }
            var validAuthorization = ctrl.isValidAutorization(ctrl.formDirty);
            if (($('#add_patient_form').valid() && validAuthorization) || !ctrl.formDirty) {
                if (ctrl.editMode) {
                    $state.go('^.' + state, {id: $state.params.id});
                }
            }
            event.stopPropagation();   // W3C model
        }

        //function to save patient data.
        function savePatientData() {
            var validAuthorization = ctrl.isValidAutorization(true);
            if ($('#add_patient_form')[0].checkValidity() && validAuthorization) {
                var patientToSave = angular.copy(ctrl.patient);
//                if (patientToSave.subscriberInfo && patientToSave.subscriberInfo[0] && patientToSave.subscriberInfo[0].dateOfBirth) {
//                    patientToSave.subscriberInfo[0].dateOfBirth = new Date(patientToSave.subscriberInfo[0].dateOfBirth);
//                }
//                if (patientToSave.dateOfBirth) {
//                    patientToSave.dateOfBirth = new Date(patientToSave.dateOfBirth);
//                }
//                if (patientToSave.authorizationStartDate) {
//                    patientToSave.authorizationStartDate = new Date(patientToSave.authorizationStartDate);
//                }
//                if (patientToSave.authorizationEndDate) {
//                    patientToSave.authorizationEndDate = new Date(patientToSave.authorizationEndDate);
//                }
                patientToSave.languagesSpoken = [];
                angular.forEach(ctrl.languagesKeyValue, function (obj) {
                    if (obj.value == true) {
                        patientToSave.languagesSpoken.push(obj.key);
                    }
                });
                patientToSave.languagesSpoken = patientToSave.languagesSpoken.toString();

                var reqParam;
                if (ctrl.patient.id && ctrl.patient.id !== null) {
                    reqParam = 'update';
                    if (ctrl.careTypes && ctrl.careTypes !== null) {
                        var finalCareTypeCollection = [];
                        if (!ctrl.patient.patientCareTypeCollection) {
                            ctrl.patient.patientCareTypeCollection = [];
                        }
                        patientToSave.patientCareTypeCollection = [];
                        for (var j = 0; j < ctrl.careTypes.length; j++) {
                            for (var i = ctrl.patient.patientCareTypeCollection.length; i > 0; i--) {
                                if (ctrl.careTypes[j] === ctrl.patient.patientCareTypeCollection[i - 1].insuranceCareTypeId.id) {
                                    finalCareTypeCollection.push(angular.copy(ctrl.patient.patientCareTypeCollection[i - 1]));
                                    break;
                                }
                            }
                        }
                        patientToSave.patientCareTypeCollection = finalCareTypeCollection;
                    }
                } else {
                    ctrl.patient.orgCode = ontimetest.company_code;
                    patientToSave.orgCode = ontimetest.company_code;
                    reqParam = 'save';
                }
                $rootScope.maskLoading();
                PatientDAO.update({action: reqParam, data: patientToSave, changeSchedule: ctrl.changeSchedule})
                        .then(function (res) {
                            if (!ctrl.patient.id || ctrl.patient.id === null) {
                                ctrl.editMode = true;

                            }
                            if ($rootScope.tabNo === 5) {
                                $state.go('app.patient-list', {status: "active"});
                            } else {
                                $state.go('^.' + ctrl.nextTab, {id: res.id});
                            }
                            ctrl.patient = res;
                            if (res.patientCareTypeCollection) {
                                var length = res.patientCareTypeCollection.length;
                                for (var i = 0; i < length; i++) {
                                    ctrl.patientCareTypeMap[res.patientCareTypeCollection[i].insuranceCareTypeId.id] = res.patientCareTypeCollection[i];
                                }
                            }
                            toastr.success("Patient saved.");
                        })
                        .catch(function () {
                            //exception logic
                            toastr.error("Patient cannot be saved.");
                            console.log('Patient Object : ' + JSON.stringify(patientToSave));
                        }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }
        }

        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                $rootScope.maskLoading();
                PatientDAO.get({id: $state.params.id}).then(function (res) {
                    ctrl.patient = res;
                    ctrl.oldDate = ctrl.patient.authorizationEndDate;
                    ctrl.lastDate = ctrl.patient.authorizationEndDate;
                    if (res.languagesSpoken != null) {
                        var languages = res.languagesSpoken;
                        angular.forEach(ctrl.languagesKeyValue, function (obj) {
                            if (languages.indexOf(obj.key) >= 0) {
                                obj.value = true;
                            }
                        });
                    }
                    if (ctrl.patient.otherLanguages != null && ctrl.patient.otherLanguages != '') {
                        ctrl.otherLanguageCheckbox = true;
                        ctrl.refreshLanguages();
                    }
                    if (res.patientCareTypeCollection) {
                        var careTypesSelected = [];
                        var length = res.patientCareTypeCollection.length;
                        for (var i = 0; i < length; i++) {
                            ctrl.patientCareTypeMap[res.patientCareTypeCollection[i].insuranceCareTypeId.id] = res.patientCareTypeCollection[i];
                            careTypesSelected.push(res.patientCareTypeCollection[i].insuranceCareTypeId.id);
                        }
                        ctrl.careTypes = careTypesSelected;
//                        delete ctrl.patient.patientCareTypeCollection;
                    }
                    ctrl.retrivalRunning = false;
                }).catch(function (data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function () {
                        }
                    }); // showLoadingBar
                    ctrl.patient = ontimetest.patients[($state.params.id - 1)];
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.patient));
                    toastr.error("Failed to retrieve patient");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            } else {
                ctrl.retrivalRunning = false;
            }
        }

        function tab1DataInit() {
            ctrl.formDirty = false;
            $("#add_patient_form input:text, #add_patient_form textarea, #add_patient_form select").first().focus();
            //to set edit mode in tab change
            if (!$state.params.id || $state.params.id === '') {
                ctrl.editMode = false;
                ctrl.patient = {};
            } else {
                ctrl.editMode = true;
            }
            $timeout(function () {
                if (!ctrl.retrivalRunning) {
                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.gender) {
                        ctrl.patient.gender = 'M';
                    }
                    $formService.resetRadios();
                    form_data = $('#add_patient_form').serialize();
                } else {
                    ctrl.tab1DataInit();
                }
            }, 100);
        }
        function tab2DataInit() {
            ctrl.formDirty = false;
            $("#add_patient_form input:text, #add_patient_form textarea, #add_patient_form select").first().focus();
            $timeout(function () {
                if (!ctrl.retrivalRunning) {
                    googleMapFunctions(ctrl.patient.locationLatitude, ctrl.patient.locationLongitude);
                    form_data = $('#add_patient_form').serialize();

                } else {
                    ctrl.tab2DataInit();
                }
            }, 100);
        }
        function tab3DataInit() {
            ctrl.formDirty = false;
            $("#add_patient_form input:text, #add_patient_form textarea, #add_patient_form select").first().focus();
            $timeout(function () {
                if (!ctrl.retrivalRunning) {
                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.isSubscriber && ctrl.patient.isSubscriber !== false) {
                        ctrl.patient.isSubscriber = true;
                    }
                    $formService.setRadioValues('IsSubscriber', ctrl.patient.isSubscriber);
                    form_data = $('#add_patient_form').serialize();
                    $formService.resetRadios();
                } else {
                    ctrl.tab3DataInit();
                }
            }, 100);

        }
        function tab4DataInit() {
            ctrl.formDirty = false;
            $("#add_patient_form input:text, #add_patient_form textarea, #add_patient_form select").first().focus();
            $timeout(function () {
                if (!ctrl.retrivalRunning) {
                    if (ctrl.patient.insuranceProviderId && ctrl.patient.insuranceProviderId !== null) {
                        CareTypeDAO.retrieveForInsurer({insurer_id: ctrl.patient.insuranceProviderId}).then(function (res) {
                            ctrl.careTypeList = res;
                            angular.forEach(ctrl.careTypeList, function (careType) {
                                ctrl.careTypeIdMap[careType.id] = careType;
                            })
                            $timeout(function () {
                                $('#CareTypes').multiSelect('refresh');
                                form_data = $('#add_patient_form').serialize();
                            }, 400);
                        }).catch(function () {
                            toastr.error("Failed to retrieve care types.");
                            form_data = $('#add_patient_form').serialize();
                        });
                    } else {
                        form_data = $('#add_patient_form').serialize();
                    }
                } else {
                    ctrl.tab4DataInit();
                }
            }, 100);

        }
        function tab5DataInit() {
            ctrl.formDirty = false;
            $("#add_patient_form input:text, #add_patient_form textarea, #add_patient_form select").first().focus();
            $timeout(function () {
                if (!ctrl.retrivalRunning) {
                    if (!ctrl.patient.subscriberInfo || ctrl.patient.subscriberInfo === null
                            || ctrl.patient.subscriberInfo.length === 0) {
                        ctrl.patient.subscriberInfo = [];
                        ctrl.patient.subscriberInfo[0] = {};
                    }
                    if (ctrl.patient.isSubscriber && ctrl.patient.isSubscriber === true) {
                        ctrl.patient.subscriberInfo[0].fName = ctrl.patient.fName;
                        ctrl.patient.subscriberInfo[0].lName = ctrl.patient.lName;
                        ctrl.patient.subscriberInfo[0].middleInitial = ctrl.patient.middleInitial;
                        ctrl.patient.subscriberInfo[0].nameSuffix = ctrl.patient.nameSuffix;
                        ctrl.patient.subscriberInfo[0].dateOfBirth = ctrl.patient.dateOfBirth;
                        ctrl.patient.subscriberInfo[0].gender = ctrl.patient.gender;
                        ctrl.patient.subscriberInfo[0].relationshipWithPatient = 'I';

                    }
                    if (!ctrl.patient.subscriberInfo[0].subscriberAddressCollection) {
                        ctrl.patient.subscriberInfo[0].subscriberAddressCollection = [];
                        ctrl.patient.subscriberInfo[0].subscriberAddressCollection[0] = {};
                    }
                    if (!ctrl.patient.subscriberInfo[0].subscriberAddressCollection[0].address1
                            || ctrl.patient.subscriberInfo[0].subscriberAddressCollection[0].address1 === null) {
                        var address = {};
                        if (ctrl.patient.patientAddress) {
                            address.address1 = ctrl.patient.patientAddress.address1;
                            address.address2 = ctrl.patient.patientAddress.address2;
                            address.city = ctrl.patient.patientAddress.city;
                            address.state = ctrl.patient.patientAddress.state;
                            address.zipcode = ctrl.patient.patientAddress.zipcode;
                        }
                        ctrl.patient.subscriberInfo[0].subscriberAddressCollection = [];
                        ctrl.patient.subscriberInfo[0].subscriberAddressCollection.push(address);
                        $scope.$apply();
                        ctrl.isBillingAddressSameAsPatient = 'Yes';
                        $formService.setRadioValues('IsBillingAddressSameAsPatient', 'Yes');
                    } else {
                        setBillingAddressRadioButton();
                    }
                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.subscriberInfo[0].gender) {
                        ctrl.patient.subscriberInfo[0].gender = 'M';
                    }
                    $formService.setRadioValues('Gender', ctrl.patient.subscriberInfo[0].gender);
                    form_data = $('#add_patient_form').serialize();
                    $formService.resetRadios();
                } else {
                    ctrl.tab5DataInit();
                }
            }, 100);
        }

        function setBillingAddress(sameAsPatientAddress) {
            var address = {};
            if (sameAsPatientAddress === true) {
                address.address1 = ctrl.patient.patientAddress.address1;
                address.address2 = ctrl.patient.patientAddress.address2;
                address.city = ctrl.patient.patientAddress.city;
                address.state = ctrl.patient.patientAddress.state;
                address.zipcode = ctrl.patient.patientAddress.zipcode;
                $("#Address1").blur();
                $("#Address2").blur();
                $("#City").blur();
                $("#State").blur();
                $("#ZipCode").blur();
            }
            ctrl.patient.subscriberInfo[0].subscriberAddressCollection[0] = address;
        }

        function setBillingAddressRadioButton() {
            var subscriberAddress = ctrl.patient.subscriberInfo[0].subscriberAddressCollection[0];
            var patientAddress = ctrl.patient.patientAddress;
            if (subscriberAddress.address1 === patientAddress.address1
                    && subscriberAddress.address2 === patientAddress.address2
                    && subscriberAddress.city === patientAddress.city
                    && subscriberAddress.state === patientAddress.state
                    && subscriberAddress.zipcode === patientAddress.zipcode) {
                ctrl.isBillingAddressSameAsPatient = 'Yes';
                $formService.setRadioValues('IsBillingAddressSameAsPatient', 'Yes');
            } else {
                ctrl.isBillingAddressSameAsPatient = 'No';
                $formService.setRadioValues('IsBillingAddressSameAsPatient', 'No');
            }
        }

        ctrl.pageInitCall();

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
        ctrl.openModal = function (modal_id, modal_size, modal_backdrop, selection)
        {
            //use the same pop up modal based on selection true/false
            $rootScope.careTypeModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            //to not open the popup for changes done in this modals
            if (selection) {
                ctrl.selecteModalOpen = true;
                $rootScope.careTypeModel.title = ctrl.careTypeIdMap[ctrl.newSelectedType].companyCaretypeId.careTypeTitle;
            } else {
                //for remove button in unselection
                $rootScope.careTypeModel.showRemove = true;
                ctrl.unselecteModalOpen = true;
                $rootScope.careTypeModel.title = ctrl.careTypeIdMap[ctrl.newDeselectedType[0]].companyCaretypeId.careTypeTitle;
            }
            //initialize or copy the careTypeObj
            if (selection) {
                $rootScope.careTypeModel.careTypeObj = {};
            } else {
                $rootScope.careTypeModel.careTypeObj = angular.copy(ctrl.patientCareTypeMap[ctrl.newDeselectedType[0]]);
            }
            $rootScope.careTypeModel.save = function () {
                $timeout(function () {
                    if ($('#care_type_form')[0].checkValidity()) {
                        if (selection) {
                            $rootScope.careTypeModel.careTypeObj.insuranceCareTypeId = ctrl.careTypeIdMap[ctrl.newSelectedType];
                            ctrl.patientCareTypeMap[ctrl.newSelectedType] = $rootScope.careTypeModel.careTypeObj;
                            var pushed = false;
                            //to not make a new entry if it is selected again(exists in a list.)
                            for (var i = 0; i < ctrl.patient.patientCareTypeCollection.length; i++) {
                                if (ctrl.patient.patientCareTypeCollection[i].insuranceCareTypeId.id === Number(ctrl.newSelectedType)) {
                                    pushed = true;
                                    ctrl.patient.patientCareTypeCollection[i].authorizedHours = $rootScope.careTypeModel.careTypeObj.authorizedHours;
                                }
                            }
                            if (!pushed) {
                                ctrl.patient.patientCareTypeCollection.push($rootScope.careTypeModel.careTypeObj);
                            }
                        } else {
                            //for edit part
                            ctrl.patientCareTypeMap[Number(ctrl.newDeselectedType[0])] = $rootScope.careTypeModel.careTypeObj;
                            for (var i = 0; i < ctrl.patient.patientCareTypeCollection.length; i++) {
                                if (ctrl.patient.patientCareTypeCollection[i].insuranceCareTypeId.id === Number(ctrl.newDeselectedType[0])) {
                                    ctrl.patient.patientCareTypeCollection[i].authorizedHours = $rootScope.careTypeModel.careTypeObj.authorizedHours;
                                }
                            }
                            ctrl.careTypes.push(Number(ctrl.newDeselectedType[0]));
                        }
                        $rootScope.careTypeModel.dismiss();
                        if (selection) {
                            //make this false when selection process should end casually.
                            ctrl.selecteModalOpen = false;
                        } else {
                            $timeout(function () {
                                $("#CareTypes").multiSelect('refresh');
                            });
                        }
                    }
                });
            };

            $rootScope.careTypeModel.remove = function () {
                $timeout(function () {
                    //make this false when unselection process should end casually.
                    ctrl.unselecteModalOpen = false;
                    $rootScope.careTypeModel.dismiss();
                });
            };

            $rootScope.careTypeModel.cancel = function () {
                //reverse the action.
                if (selection) {
                    var careTypes = [];
                    for (var i = 0; i < ctrl.careTypes.length; i++) {
                        if (ctrl.careTypes[i].toString() !== ctrl.newSelectedType.toString()) {
                            careTypes.push(ctrl.careTypes[i]);
                        }
                    }
                    ctrl.careTypes = careTypes;
                } else {
                    ctrl.careTypes.push(Number(ctrl.newDeselectedType[0]));
                }
                $timeout(function () {
                    $("#CareTypes").multiSelect('refresh');
                    $rootScope.careTypeModel.close();
                });
            };

        };

        $scope.$watch(function () {
            return ctrl.careTypes;
        }, function (newValue, oldValue) {
            $timeout(function () {
                $("#CareTypes").multiSelect('refresh');
            });
            if (ctrl.displayCareTypeModal && newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                if (!ctrl.unselecteModalOpen) {
                    if (oldValue == null) {
                        ctrl.newSelectedType = newValue;
                    } else {
                        ctrl.newSelectedType = arr_diff(newValue, oldValue);
                    }
                    ctrl.openModal('modal-5', 'md', 'static', true);
                } else {
                    ctrl.unselecteModalOpen = false;
                }
            } else if (oldValue !== null && newValue.length < oldValue.length) {
                if (!ctrl.selecteModalOpen) {
                    ctrl.newDeselectedType = arr_diff(oldValue, newValue);
                    ctrl.openModal('modal-5', 'md', 'static', false);
                } else {
                    ctrl.selecteModalOpen = false;
                }
            }
        }, true);

        function googleMapFunctions(latitude, longitude) {

            loadGoogleMaps(3).done(function ()
            {

                var map;
                var geocoder = new google.maps.Geocoder();



                var newyork;
                if (latitude && latitude !== null && longitude && longitude !== null) {
                    newyork = new google.maps.LatLng(latitude, longitude);
                } else {
                    newyork = new google.maps.LatLng(40.7127837, -74.00594);
                }

                var marker

// Add a marker to the map and push to the array.
                function addMarker(location) {
//                    clearMarkers();
//                    marker = new google.maps.Marker({
//                        position: location,
//                        map: map,
//                        draggable: true,
////                        animation: google.maps.Animation.DROP
//                    });
                    marker.setPosition(location);
                }
                function initialize()
                {
                    var mapOptions = {
                        zoom: 12,
                        center: newyork
                    };

                    // Calculate Height
                    var el = document.getElementById('map-1'),
                            doc_height = $('#map-1').height();

                    // Adjust map height to fit the document contianer
                    el.style.height = doc_height + 'px';

                    map = new google.maps.Map(el, mapOptions);

                    // This event listener will call addMarker() when the map is clicked.
//                    google.maps.event.addListener(map, 'click', function(event) {
//                        addMarker(event.latLng);
//                        $('#GPSLocation').val(event.latLng);
//                        ctrl.patient.locationLatitude = event.latLng.lat();
//                        ctrl.patient.locationLongitude = event.latLng.lng();
//
//                    });
                    marker = new google.maps.Marker({
                        position: newyork,
                        map: map,
                        draggable: true,
//                        animation: google.maps.Animation.DROP
                    });

                    google.maps.event.addListener(marker, 'drag', function (event) {
                        $('#GPSLocation').val(event.latLng);
                        $('#GPSLocation').blur();
                        ctrl.patient.locationLatitude = event.latLng.lat();
                        ctrl.patient.locationLongitude = event.latLng.lng();
                    });

                    google.maps.event.addListener(marker, 'dragend', function (event) {
                        $('#GPSLocation').val(event.latLng);
                        $('#GPSLocation').blur();
                        ctrl.patient.locationLatitude = event.latLng.lat();
                        ctrl.patient.locationLongitude = event.latLng.lng();
                    });

                    // Adds a marker at the center of the map.
//                    addMarker(newyork);

                    $('#GPSLocation').val(newyork);
                    form_data = $('#add_patient_form').serialize();
                }

                initialize();
                $("#address-search").click(function (ev)
                {
                    ev.preventDefault();

                    // var $inp = $(this).find('.form-control'),
                    var address = $('#Search').val().trim();

                    // $inp.prev().find('i').addClass('fa-spinner fa-spin');

                    if (address.length != 0)
                    {
                        geocoder.geocode({'address': address}, function (results, status)
                        {
                            // $inp.prev().find('i').removeClass('fa-spinner fa-spin');

                            if (status == google.maps.GeocoderStatus.OK)
                            {
                                $('#GPSLocation').val(results[0].geometry.location);
                                $('#GPSLocation').blur();
                                ctrl.patient.locationLatitude = results[0].geometry.location.lat();
                                ctrl.patient.locationLongitude = results[0].geometry.location.lng()
                                map.setCenter(results[0].geometry.location);
                                addMarker(results[0].geometry.location);
//                                var marker = new google.maps.Marker({
//                                    map: map,
//                                    position: results[0].geometry.location,
//                                    draggable: false
//                                });

                            } else {
                                alert('Geocode was not successful for the following reason: ' + status);
                            }
                        });
                    }
                });
            });
        }
        ctrl.uploadFile = {
            target: ontimetest.weburl + 'file/upload',
            chunkSize: 1024 * 1024 * 1024,
            testChunks: false,
            fileParameterName: "fileUpload",
            singleFile: true,
            headers: {
                type: "p",
                company_code: ontimetest.company_code
            }
        };
        //When file is selected from browser file picker
        ctrl.fileSelected = function (file, flow) {
            ctrl.fileObj.flowObj = flow;
            ctrl.fileObj.selectedFile = file;
            ctrl.fileObj.flowObj.upload();
        };
        //When file is uploaded this method will be called.
        ctrl.fileUploaded = function (response, file, flow) {
            if (response != null) {
                response = JSON.parse(response);
                if (response.fileName != null && response.status != null && response.status == 's') {
                    ctrl.patient.authorization = response.fileName;
                }
            }
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
        };
        ctrl.fileError = function ($file, $message, $flow) {
            $flow.cancel();
            ctrl.disableSaveButton = false;
            ctrl.disableUploadButton = false;
            ctrl.fileName = "";
            ctrl.fileExt = "";
            ctrl.patient.authorization = null;
            ctrl.fileObj.errorMsg = "File cannot be uploaded";
        };
        //When file is added in file upload
        ctrl.fileAdded = function (file, flow) { //It will allow all types of attachments'
            ctrl.formDirty = true;
            ctrl.patient.authorization = null;
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

        ctrl.authorizationDateChanged = function () {
            if (ctrl.checkSchedule && ctrl.patient.authorizationEndDate !== ctrl.oldDate) {
                var a = moment(new Date(ctrl.patient.authorizationEndDate));
                var b = moment(new Date(ctrl.oldDate));
                var diff = b.diff(a, 'days');
                var extend = true;
                if (diff > 0) {
                    extend = false;
                }
                ctrl.openModalExisting('exist-schedule-modal', 'md', 'static', false, extend);
            } else if (ctrl.checkSchedule && ctrl.patient.authorizationEndDate === ctrl.oldDate) {
                delete ctrl.changeSchedule;
            }
        };

        ctrl.openModalExisting = function (modal_id, modal_size, modal_backdrop, selection, extend)
        {
            //use the same pop up modal based on selection true/false
            $rootScope.existingModel = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            $rootScope.existingModel.extend = extend;
            $rootScope.existingModel.extendSequence = function () {
                $timeout(function () {
                    ctrl.changeSchedule = true;
                    ctrl.lastDate = angular.copy(ctrl.patient.authorizationEndDate);
                    $rootScope.existingModel.dismiss();
                });
            };

            $rootScope.existingModel.updateOnly = function () {
                $timeout(function () {
                    delete ctrl.changeSchedule;
                    ctrl.lastDate = angular.copy(ctrl.patient.authorizationEndDate);
                    $rootScope.existingModel.dismiss();
                });
            };

            $rootScope.existingModel.cancel = function () {
                $timeout(function () {
                    delete ctrl.changeSchedule;
                    ctrl.patient.authorizationEndDate = ctrl.lastDate;
                    $rootScope.existingModel.close();
                });
            };

        };

        ctrl.checkSchedule = false;
        if ($state.params.id != '') {
            PatientDAO.checkSchedule({patientId: $state.params.id})
                    .then(function (res) {
                        if (res.data == 'true') {
                            ctrl.checkSchedule = true;
                        }
                    });
        }
    }
    angular.module('xenon.controllers').controller('AddPatientCtrl', ["$formService", "$state", "PatientDAO", "$timeout", "$scope", "$rootScope", "CareTypeDAO", "EmployeeDAO", "InsurerDAO", "Page", "$modal", AddPatientCtrl]);
})();
