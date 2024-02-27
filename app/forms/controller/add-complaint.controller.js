(function () {
    function AddComplaintController($scope, $state, $timeout, $rootScope, $stateParams, $modal, $filter, PatientDAO, EmployeeDAO, WorksiteDAO, FormsDAO, $window, Page) {
        var ctrl = this;
        Page.setTitle("Add Complaint");
        ctrl.currentUser = $rootScope.currentUser
        ctrl.currentDate = new Date();
        ctrl.fiveDaysAgo = new Date();
        ctrl.currentDateWithFormat = $filter('date')(ctrl.currentDate, 'MM/dd/yyyy');
        ctrl.resolutionNotifDate = $filter('date')(ctrl.fiveDaysAgo.setDate(ctrl.currentDate.getDate() - 5), 'MM/dd/yyyy');
        ctrl.searchParamsForEmployee = { limit: 10, subActio: 'active', pageNo: 1, name: '' };
        ctrl.patientList = [];
        ctrl.employeeList = [];
        ctrl.complaintTypes = angular.copy(ontime_data.complaintTypes)
        ctrl.reviewedComplaint = true;
        ctrl.formSubmitted = false;
        ctrl.isSignAdded = false;
        ctrl.isSignTouched = false;
        ctrl.signatureUrl = ''
        ctrl.submitAction = true;
        ctrl.generateFormCall = generateForms;
        ctrl.clearSignatureCall = clearSignature;
        // ctrl.signatureInitCall = signatureInit
        ctrl.getListsCall = getLists
        ctrl.complaint = {};
        ctrl.title = 'Add Complaint';
        ctrl.subtitle = 'Create A New Complaint By Entering Complaint Information';
        ctrl.params = $stateParams;
        if (ctrl.params?.id) {
            ctrl.title = 'Edit Complaint';
            ctrl.subtitle = 'Edit The Complaint By Entering Complaint Information';
            Page.setTitle("Edit Complaint")
        }
        ctrl.closingComplaint = true;

        /*================   FUNCTION CALLS   ===================*/
        ctrl.generateFormCall();
        // ctrl.signatureInitCall()
        ctrl.getListsCall()

        ctrl.saveComplaintForm = function (action) {
            console.log(action);
        }

        /*================   FORM FUNCTIONS   ===================*/
        function generateForms() {
            $rootScope.isFormDirty = false;
            ctrl.clearSignatureCall()

            if (ctrl.params?.id) {
                let complaintData = {};
                FormsDAO.getComplaintById({ id: ctrl.params?.id }).then(res => {
                    complaintData = res;
                    console.log(res);
                    console.log(complaintData);
                    ctrl.complaint = {
                        complaintDate: ctrl.getDate(complaintData.complaintDate),
                        complainantName: complaintData.complainantName,
                        complainantContactType: complaintData.complainantContactType == 1 ? 'PHONE' : complaintData.complainantContactType == 2 ? 'EMAIL' : 'ADDRESS',
                        complaintMethod: complaintData.complaintMethod == 1 ? 'PHONE' : complaintData.complaintMethod == 2 ? 'WRITING' : complaintData.complaintMethod == 3 ? 'EMAIL' : 'INPERSON',
                        complainantRelationshipType: complaintData.complainantRelationshipType == 1 ? 'PATIENT' : complaintData.complainantRelationshipType == 2 ? 'EMPLOYEE' : complaintData.complainantRelationshipType == 3 ? 'WORKSITE' : 'VENDOR',
                        complainantRelationship: complaintData.complainantRelationship,
                        complaintType: complaintData.complaintType,
                        complaintDescription: complaintData.complaintDescription,
                        complaintFollowUp: complaintData.complaintFollowUp.toString(),
                        // complaintNotificationMethod: 'PHONE',
                        complaintResolution: "",
                        complaintSatisfied: "",
                        dateProposedResolution: '',
                        signature: "",
                    };
                    ctrl.getContactValue(complaintData.complainantContactType, complaintData.complainantContact);
                    // ctrl.getRelationValue(complaintData.complaintRelationshipType, complaintData.complainantRelationship)
                }).catch(err => {
                    toastr.error("Couldn't get complaint");
                    $window.history.back();
                })

            } else {
                ctrl.complaint = {
                    complaintDate: ctrl.currentDateWithFormat,
                    complainantName: "",
                    complainantContactType: "PHONE",
                    complainantContact: "",
                    complainantRelationshipType: "PATIENT",
                    complainantRelationship: "",
                    complaintMethod: "PHONE",
                    complaintType: "",
                    complaintDescription: "",
                    complaintFollowUp: "true",
                    // complaintNotificationMethod: 'PHONE',
                    complaintResolution: "",
                    complaintSatisfied: "",
                    dateProposedResolution: '',
                    signature: "",
                };
                setupWatch()

            }



        }

        ctrl.resetForm = function () {
            ctrl.generateFormCall()
        }

        function clearSignature() {
            ctrl.complaint.signature = ''
            ctrl.signatureUrl = ''
        }

        ctrl.saveForm = function (action) {

            if ($('#add_complaint_form')[0].checkValidity()) {
                var complaintToSave = angular.copy(ctrl.complaint);

                complaintToSave.complainantRelationship = complaintToSave.complainantRelationship.toString()
                complaintToSave.signature = complaintToSave.signature ? complaintToSave.signature.substring(ctrl.signature.indexOf(",") + 1) : '';
                complaintToSave.complaintFollowUp = JSON.parse(complaintToSave.complaintFollowUp)
                console.log(complaintToSave);

                // Check the value of the complainantContactType field
                switch (complaintToSave.complainantContactType) {
                    case 'PHONE':
                        complaintToSave.complainantContact = complaintToSave.complainantContactPhone;
                        deleteContactTypes(complaintToSave)
                        break;
                    case 'EMAIL':
                        complaintToSave.complainantContact = complaintToSave.complainantContactEmail;
                        deleteContactTypes(complaintToSave)
                        break;
                    case 'ADDRESS':
                        complaintToSave.complainantContact = complaintToSave.complainantContactAddress;
                        deleteContactTypes(complaintToSave)
                        break;
                }

                $rootScope.maskLoading();
                if (ctrl.params?.id) {
                    complaintToSave.id = ctrl.params?.id
                    FormsDAO.updateComplaint(complaintToSave).then((res) => {
                        // ctrl.generateFormCall();
                        $rootScope.isFormDirty = false;
                        toastr.success("Complaint updated successfully")
                        if ($.fn.dirtyForms) {
                            $('form').dirtyForms('setClean');
                            $('.dirty').removeClass('dirty');
                        }

                        $state.go('app.complaints', { status: 'open' });
                    }).catch((err) => {
                        toastr.error("Unable to update the Complaint.");
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    })
                } else {
                    FormsDAO.addComplaint(complaintToSave).then((res) => {
                        // ctrl.generateFormCall();
                        $rootScope.isFormDirty = false;
                        toastr.success("Complaint saved successfully")
                        if ($.fn.dirtyForms) {
                            $('form').dirtyForms('setClean');
                            $('.dirty').removeClass('dirty');
                        }

                        $state.go('app.complaints', { status: 'open' });
                    }).catch((err) => {
                        toastr.error("Unable to save the Complaint.");
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }

            }
        }

        function deleteContactTypes(obj) {
            delete obj.complainantContactPhone
            delete obj.complainantContactEmail
            delete obj.complainantContactAddress
        }

        /*================   GETTING LISTS   ===================*/
        async function getLists() {
            try {
                await Promise.all([
                    getPatientsList(),
                    getEmployeesList(),
                    getWorksiteList()
                ]);
            } catch (error) {
                console.error('Error:', error);
                toastr.error('An error occurred while fetching data.');
            }
        }

        function getPatientsList() {
            return PatientDAO.retrieveForSelect({ 'status': 'active' }).then(function (res) {
                ctrl.patientList = res;
                if ($state.params.patientId && $state.params.patientId !== '') {
                    ctrl.search.patientId = $state.params.patientId;
                }
            }).catch(function () {
                toastr.error("Failed to retrieve patient list.");
            });
        }

        function getEmployeesList() {
            return EmployeeDAO.retrieveAll({ subAction: 'active' }).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                });
                ctrl.employeeList = res;
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve employees.");
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {

                    }
                });
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });
        }

        function getWorksiteList() {
            return WorksiteDAO.retrieveAll({ subAction: 'active' }).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }

                }); // showLoadingBar                
                if (res) {
                    ctrl.worksiteList = res;
                    if (res.length === 0) {
                        //                        $("#paginationButtons").remove();
                        //                        toastr.error("No data in the system.");
                    }
                    // if (angular.equals({}, positionMap))
                    //     retrieveActivePositions();
                }

            }).catch(function (data, status) {
                toastr.error("Failed to retrieve worksites.");
            }).then(function () {
                $rootScope.unmaskLoading();
                $rootScope.paginationLoading = false;
            });
        }

        /*================   UTILITY FUNCTIONS   ===================*/
        ctrl.relationToOrgChange = function () {
            ctrl.complaint.complainantRelationship = ''
        }

        function autoCompleteLocation() {
            const placeInput = document.getElementById('placeInput');
            var autocompleteAddress = new google.maps.places.Autocomplete(placeInput);
            google.maps.event.addListener(autocompleteAddress, 'place_changed', function () {
                const place = autocompleteAddress.getPlace();
                ctrl.complaint.contactInfo.value = place.formatted_address;
            });
        }

        ctrl.contactChange = function () {
            ctrl.complaint.complainantContact = ''
            if (ctrl.complaint.complainantContactType == 'ADDRESS') {
                $timeout(autoCompleteLocation, 200)
            }
        }

        ctrl.typeChange = function (value) {
            if (value !== 'other') {
                delete ctrl.complaint.otherComplaint
            }
        }


        ctrl.complainantSatisfiedChange = function () {
            if (ctrl.complaint.complainantSatisfied !== 'no') {
                delete ctrl.complaint.implementedFollowUp
            }
        }

        ctrl.sanitizeHtml = function (htmlContent) {
            return $sce.trustAsHtml(htmlContent);
        };

        function setupWatch() {
            $scope.$watch(function () {
                return ctrl.complaint
            }, function (newValue, oldValue) {
                if (newValue != oldValue) {
                    $rootScope.isFormDirty = true;
                }
            }, true);
        }

        ctrl.getDate = function (date) {
            return $filter('date')(date, 'MM/dd/yyyy')
        }

        ctrl.getContactValue = function (type, value) {
            console.log(type, value);
            if (type == 1)
                ctrl.complaint.complainantContactPhone = value
            else if (type == 2)
                ctrl.complaint.complainantContactEmail = value
            else if (type == 3)
                ctrl.complaint.complainantContactAddress = value
        }

        ctrl.getRelationValue = function (type, value) {
            console.log(type, value);
            if (type == 1)
                ctrl.complaint.complainantContactPhone = value
            else if (type == 2)
                ctrl.complaint.complainantContactEmail = value
            else if (type == 3)
                ctrl.complaint.complainantContactAddress = value
        }

        /*================   SIGNATURE CODE   ===================*/
        // function signatureInit() {
        //     const canvas = document.querySelector('#signature-pad');
        //     const form = document.querySelector('#signature-pad-container')
        //     const ctx = canvas.getContext('2d');
        //     let writingMode = false;
        //     ctrl.createSignature = function (event) {
        //         event.preventDefault();
        //         ctrl.isSignAdded = true;
        //         const imageUrl = canvas.toDataURL();
        //         ctrl.signatureImgUrl = canvas.toDataURL();
        //         const image = document.createElement('img');
        //         image.src = imageUrl;
        //         image.height = canvas.height / 2
        //         image.width = canvas.width / 2
        //         image.setAttribute('id', 'sign-image')
        //         image.style.display = 'block';
        //         form.appendChild(image);
        //         ctrl.clearPad()
        //     }

        //     ctrl.deleteSignature = function () {
        //         ctrl.isSignAdded = false;
        //         ctrl.isSignTouched = false
        //         document.getElementById('sign-image').remove()
        //     }

        //     ctrl.clearPad = function () {
        //         ctx.clearRect(0, 0, canvas.width, canvas.height);
        //         ctrl.isSignTouched = false
        //     }


        //     function isCanvasEmpty() {
        //         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        //         for (let i = 0; i < imageData.length; i += 4) {
        //             // Check if any pixel has a non-zero alpha value (indicating it has content)
        //             if (imageData[i + 3] !== 0) {
        //                 return false;
        //             }
        //         }

        //         return true;
        //     }

        //     const getTargetPosition = (event) => {
        //         positionX = event.clientX - event.target.getBoundingClientRect().x
        //         positionY = event.clientY - event.target.getBoundingClientRect().y

        //         return [positionX, positionY]
        //     }

        //     const handlePointerMove = function (event) {
        //         if (!writingMode) return;

        //         const [postionX, postionY] = getTargetPosition(event);
        //         ctx.lineTo(postionX, postionY)
        //         ctx.stroke()
        //     }

        //     const handlePointerUp = () => {
        //         if (isCanvasEmpty()) {
        //             ctrl.isSignTouched = false
        //             console.log(ctrl.isSignTouched);
        //         } else {
        //             ctrl.isSignTouched = true
        //             console.log(ctrl.isSignTouched);
        //         }
        //         writingMode = false;
        //     }

        //     const handlePointerDown = (event) => {
        //         if (ctrl.isSignAdded) return;
        //         writingMode = true;
        //         ctx.beginPath();
        //         const [postionX, postionY] = getTargetPosition(event)
        //         ctx.moveTo(postionX, postionY);
        //     }

        //     ctx.lineWidth = 3;
        //     ctx.lineJoin = ctx.lineCap = 'round';

        //     canvas.addEventListener('pointerup', handlePointerUp, { passive: true })
        //     canvas.addEventListener('pointerdown', handlePointerDown, { passive: true })
        //     canvas.addEventListener('pointermove', handlePointerMove, { passive: true })
        // }
    }
    angular.module('xenon.controllers').controller('AddComplaintController', ["$scope", "$state", "$timeout", "$rootScope", "$stateParams", "$modal", "$filter", "PatientDAO", "EmployeeDAO", "WorksiteDAO", "FormsDAO", '$window', "Page", AddComplaintController]);
})();
