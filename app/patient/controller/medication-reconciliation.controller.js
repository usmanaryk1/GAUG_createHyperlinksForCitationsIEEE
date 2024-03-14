
(function () {
    function MedicationReconciliationCtrl($rootScope, PatientDAO, $state, $http, $sce, $window, $timeout, $scope) {
        'use strict';
        const formUrl = appHelper.assetPath('json/patient_form.json');
        var ctrl = this;
        ctrl.patientName;
        ctrl.patientId = $state.params.id
        ctrl.showSignError = false;

        ctrl.medObj = {
            nurseNote: '',
            nurseSign: '',
            medications: []
        }

        // MEDICATION ARRAY
        ctrl.medicationsArr = [
            {
                medication: '',
                dosage: '',
                dosageUnit: 'mg',
                frequency: '',
                frquencyOther: '',
                route: '',
                purpose: ''
            }
        ]

        // Function to add a new medication
        ctrl.addMedication = function (index) {
            
            $(document).ready(function ($) {
                setTimeout(function () {
                    $('#medications' + (index + 1)).select2({
                        placeholder: 'Select Medication',
                    }).on('select2-open', function () {
                        // Adding Custom Scrollbar
                        $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                    });
                }, 200);
            });

  

            ctrl.medicationsArr.push({
                medication: '',
                dosage: '',
                dosageUnit: 'mg',
                frequency: '',
                frquencyOther: '',
                route: '',
                purpose: ''
            });


        };

        ctrl.submitForm = function () {
            console.log(ctrl.medObj.nurseSign, ctrl.showSignError);
            if (ctrl.medObj.nurseSign == '') {
                ctrl.showSignError = true
                console.log(ctrl.medObj.nurseSign, ctrl.showSignError);
            } else {
                ctrl.showSignError = false
            }

            if ($('#medication_reconciliation_form')[0].checkValidity()) {
                console.log('VERIFICATION');
            }
        }

        // WATCHER
        $scope.$watch('medRecon.medObj.nurseSign', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                if (newVal == '') {
                    ctrl.showSignError = true;
                } else {
                    ctrl.showSignError = false;
                }
            }
        });



        // Function to remove a medication
        ctrl.removeMedication = function (index) {
            ctrl.medicationsArr.splice(index, 1);
        };

        ctrl.clearSign = function () {
            ctrl.medObj.nurseSign = ''
            ctrl.showSignError = true;
        }

        ctrl.medicationsData = [
            {
                med: 'Test'
            },
            {
                med: 'Test 2'
            },
            {
                med: 'Test 3'
            },
            {
                med: 'Test 4'
            },
            {
                med: 'Test 5'
            },
            {
                med: 'Test 6'
            },
            {
                med: 'Test 7'
            },
            {
                med: 'Test 8'
            },
            {
                med: 'Test 9'
            },
            {
                med: 'Test 10'
            },
            {
                med: 'Test 11'
            },
            {
                med: 'Test 12'
            },
            {
                med: 'Other'
            }
        ]

        ctrl.pageInitCall = pageInit;



        ctrl.routesArr = [
            { title: 'Oral', id: 1 },
            { title: 'Rectal', id: 2 },
            { title: 'Intradermal', id: 3 },
        ]


        function pageInit() {
            $rootScope.maskLoading();
            PatientDAO.get({ id: $state.params.id }).then(function (res) {
                ctrl.patient = res;
                ctrl.patientName = res.fName
                console.log(res);
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                });
                toastr.error("Failed to retrieve patient");
            }).then(function () {
                $rootScope.unmaskLoading();
            });
        }


        ctrl.pageInitCall()


    };
    angular.module('xenon.controllers').controller('MedicationReconciliationCtrl', ["$rootScope", "PatientDAO", "$state", "$http", "$sce", "$window", "$timeout", "$scope", MedicationReconciliationCtrl]);
})();
