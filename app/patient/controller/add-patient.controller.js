(function() {
    function AddPatientCtrl($formService, $state, PatientDAO, $timeout, $scope) {
        var ctrl = this;
        ctrl.retrivalRunning = false;
        ctrl.fileObj = {};
//        ctrl.formDirty = false;
        ctrl.patient = {};
        if ($state.params.id && $state.params.id !== '') {
            if (isNaN(parseFloat($state.params.id))) {
                $state.transitionTo(ontimetest.defaultState);
            }
            ctrl.editMode = true;
        } else if ($state.current.name.indexOf('tab1') > -1) {
            ctrl.editMode = false;
        } else {
            $state.transitionTo(ontimetest.defaultState);
        }
        var form_data;

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

        //ceck if form has been changed or not
        //If changed then it should be valid
        //function to navigate to different tab by state
        function navigateToTab(event, state) {
            // Don't propogate the event to the document
            if ($('#add_patient_form').serialize() !== form_data) {
                ctrl.formDirty = true;
            }
            if ($('#add_patient_form').valid() || !ctrl.formDirty) {
                if (ctrl.editMode) {
                    $state.go('^.' + state, {id: $state.params.id});
                }
            }
            event.stopPropagation();   // W3C model
        }

        //function to save patient data.
        function savePatientData() {
            if ($('#add_patient_form')[0].checkValidity()) {
                var patientToSave = angular.copy(ctrl.patient);
                var reqParam;
                if (ctrl.patient.id && ctrl.patient.id !== null) {
                    reqParam = 'update';
                    delete patientToSave.careTypes;
                    if (ctrl.patient.careTypes && ctrl.patient.careTypes !== null) {
                        patientToSave.patientCareTypeCollection = [];
                        for (var i = 0; i < ctrl.patient.careTypes.length; i++) {
                            patientToSave.patientCareTypeCollection.push(Number(ctrl.patient.careTypes[i]));
                        }
                    }
                } else {
                    reqParam = 'save';
                }

                PatientDAO.update({action: reqParam, data: patientToSave})
                        .then(function(res) {
                            if (!ctrl.patient.id || ctrl.patient.id === null) {
                                $state.go('^.tab1', {id: res.id});
                                ctrl.editMode = true;
                                ctrl.patient.id = res.id;
                            }
                        })
                        .catch(function() {
                            if (!ctrl.patient.id || ctrl.patient.id === null) {
                                $state.go('^.tab1', {id: 1});
                                ctrl.editMode = true;
                                ctrl.patient.id = 1;
                            }
                            //exception logic
                            console.log('Patient Object : ' + JSON.stringify(patientToSave));
                        });

            }
        }

        //function called on page initialization.
        function pageInit() {
            if (ctrl.editMode) {
                ctrl.retrivalRunning = true;
                PatientDAO.get({id: $state.params.id}).then(function(res) {
                    ctrl.patient = res;
                    ctrl.retrivalRunning = false;
                }).catch(function(data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function() {

                        }
                    }); // showLoadingBar
                    ctrl.patient = ontimetest.patients[($state.params.id - 1)];
                    ctrl.retrivalRunning = false;
                    console.log(JSON.stringify(ctrl.patient));
                });
            }
        }

        function tab1DataInit() {
            ctrl.formDirty = false;
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.gender) {
                        ctrl.patient.gender = 'M';
                    }
                    $formService.setRadioValues('Gender', ctrl.patient.gender);
                    form_data = $('#add_patient_form').serialize();
                } else {
                    ctrl.tab1DataInit();
                }
            }, 100);
        }
        function tab2DataInit() {
            ctrl.formDirty = false;
            $timeout(function() {
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
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.isSubscriber && ctrl.patient.isSubscriber !== false) {
                        ctrl.patient.isSubscriber = true;
                    }
                    $formService.setRadioValues('IsSubscriber', ctrl.patient.isSubscriber);
                    form_data = $('#add_patient_form').serialize();
                } else {
                    ctrl.tab3DataInit();
                }
            }, 100);

        }
        function tab4DataInit() {
            ctrl.formDirty = false;
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    form_data = $('#add_patient_form').serialize();
                    $('#CareTypes').multiSelect('refresh');
                } else {
                    ctrl.tab4DataInit();
                }
            }, 100);

        }
        function tab5DataInit() {
            ctrl.formDirty = false;
            $timeout(function() {
                if (!ctrl.retrivalRunning) {
                    if (!ctrl.patient.subscriberInfo) {
                        ctrl.patient.subscriberInfo = {};
                    }
                    if (!ctrl.patient.subscriberInfo.subscriberAddressCollection) {
                        ctrl.patient.subscriberInfo.subscriberAddressCollection = {};
                    }
                    if (!ctrl.patient.subscriberInfo.subscriberAddressCollection.address1
                            || ctrl.patient.subscriberInfo.subscriberAddressCollection.address1 === null) {
                        ctrl.patient.subscriberInfo.subscriberAddressCollection = angular.copy(ctrl.patient.addressDataId);
                        $scope.$apply();
                        ctrl.isBillingAddressSameAsPatient = 'Yes';
                        $formService.setRadioValues('IsBillingAddressSameAsPatient', 'Yes');
                    } else if (JSON.stringify(ctrl.patient.subscriberInfo.subscriberAddressCollection) === JSON.stringify(ctrl.patient.addressDataId)) {
                        ctrl.isBillingAddressSameAsPatient = 'Yes';
                        $formService.setRadioValues('IsBillingAddressSameAsPatient', 'Yes');
                    } else {
                        ctrl.isBillingAddressSameAsPatient = 'No';
                        $formService.setRadioValues('IsBillingAddressSameAsPatient', 'No');
                    }

                    //to select gender radio by default in angular. It was having issue due to cbr theme.
                    if (!ctrl.patient.subscriberInfo.gender) {
                        ctrl.patient.subscriberInfo.gender = 'M';
                    }
                    $formService.setRadioValues('Gender', ctrl.patient.subscriberInfo.gender);
                    form_data = $('#add_patient_form').serialize();
                } else {
                    ctrl.tab5DataInit();
                }
            }, 100);
        }

        function setBillingAddress() {
            ctrl.patient.subscriberInfo.subscriberAddressCollection = angular.copy(ctrl.patient.addressDataId);
        }

        function setBillingAddressRadioButton() {
            if (JSON.stringify(ctrl.patient.subscriberInfo.subscriberAddressCollection) === JSON.stringify(ctrl.patient.addressDataId)) {
                ctrl.isBillingAddressSameAsPatient = 'Yes';
                $formService.setRadioValues('IsBillingAddressSameAsPatient', 'Yes');
            } else {
                ctrl.isBillingAddressSameAsPatient = 'No';
                $formService.setRadioValues('IsBillingAddressSameAsPatient', 'No');
            }
        }

        ctrl.pageInitCall();
        function googleMapFunctions(latitude, longitude) {

            loadGoogleMaps(3).done(function()
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

                    google.maps.event.addListener(marker, 'drag', function(event) {
                        $('#GPSLocation').val(event.latLng);
                        ctrl.patient.locationLatitude = event.latLng.lat();
                        ctrl.patient.locationLongitude = event.latLng.lng();
                    });

                    google.maps.event.addListener(marker, 'dragend', function(event) {
                        $('#GPSLocation').val(event.latLng);
                        ctrl.patient.locationLatitude = event.latLng.lat();
                        ctrl.patient.locationLongitude = event.latLng.lng();
                    });

                    // Adds a marker at the center of the map.
//                    addMarker(newyork);

                    $('#GPSLocation').val(newyork);
                    form_data = $('#add_patient_form').serialize();
                }

                initialize();
                $("#address-search").click(function(ev)
                {
                    ev.preventDefault();

                    // var $inp = $(this).find('.form-control'),
                    var address = $('#Search').val().trim();

                    // $inp.prev().find('i').addClass('fa-spinner fa-spin');

                    if (address.length != 0)
                    {
                        geocoder.geocode({'address': address}, function(results, status)
                        {
                            // $inp.prev().find('i').removeClass('fa-spinner fa-spin');

                            if (status == google.maps.GeocoderStatus.OK)
                            {
                                $('#GPSLocation').val(results[0].geometry.location);
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
                    ctrl.patient.authorization = response.fileName;
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
            ctrl.patient.authorization = null;
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
    angular.module('xenon.controllers').controller('AddPatientCtrl', ["$formService", "$state", "PatientDAO", "$timeout", "$scope", AddPatientCtrl]);
})();