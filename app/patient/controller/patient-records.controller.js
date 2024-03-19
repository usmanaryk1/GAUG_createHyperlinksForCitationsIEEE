/* global ontime_data, _, appHelper */

(function () {
    function PatientRecordsCtrl($state, PatientDAO, PatientRecordDAO, Page, $rootScope, $timeout, $modal) {
        console.log("$state", $state);
        var ctrl = this;
        ctrl.patientList = [];
        ctrl.search = {};
        ctrl.search.title = $state.current.data && $state.current.data.title ? $state.current.data.title : null;
        ctrl.navigateToTab = navigateToTab;
        function navigateToTab() {
            $state.go('app.patient_records_patient', { patientId: ctrl.search.patientId });
        }
        PatientDAO.retrieveForSelect({ 'status': 'active' }).then(function (res) {
            ctrl.patientList = res;
            if ($state.params.patientId && $state.params.patientId !== '') {
                ctrl.search.patientId = $state.params.patientId;
            }
        }).catch(function () {
            toastr.error("Failed to retrieve patient list.");
        });
        if ($state.params.patientId && $state.params.patientId !== '') {
            if (isNaN(parseFloat($state.params.patientId))) {
                $state.transitionTo(ontime_data.defaultState);
            }
            $rootScope.maskLoading();
            PatientDAO.get({ id: $state.params.patientId }).then(function (res) {
                ctrl.patient = res;
                ctrl.search.title = ctrl.patient.lName + ", " + ctrl.patient.fName;

                PatientRecordDAO.retrieveAll({ 'patientId': ctrl.patient.id }).then(function (res) {
                    ctrl.patientRecords = res;
                }).catch(function (data, status) {
                    showLoadingBar({
                        delay: .5,
                        pct: 100,
                        finish: function () {
                        }
                    }); // showLoadingBar
                    toastr.error("Failed to retrieve patient");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                toastr.error("Failed to retrieve patient");
                $rootScope.unmaskLoading();
            });
            Page.setTitle(ctrl.search.title);
            ctrl.listPage = true;
        } else {
            ctrl.listPage = false;
        }

        ctrl.openPatientAddRecord = function () {
            var modalInstance = $modal.open({
                templateUrl: appHelper.viewTemplatePath('patient', 'patient-record-add'),
                size: "md",
                backdrop: false,
                keyboard: false,
                controller: 'PatientRecordAddCtrl as PatientRecordAddCtrl',
                resolve: {
                }
            });
            modalInstance.id = ctrl.patient.id;
        };

        ctrl.goToEditForm = function (record, action) {
            console.log(record);
            $state.go('app.edit_patient', { id: record.patientId, recordType: record.type });
            // if (record.type == 'Nursing_Assessment')
            //     $state.go('app.edit_patient', { id: record.patientId, recordType: record.type });
            // if (record.type == 'Medication_Reconciliation')
            //     $state.go('app.medication_reconciliation', { id: record.patientId });
            // if (record.type == 'Progress_Note')
            //     $state.go('app.progress_note', { id: record.patientId })
            // if (record.type == 'Medical_Orders')
            //     $state.go('app.medical_orders', { id: record.patientId })
        }

    }
    angular.module('xenon.controllers').controller('PatientRecordsCtrl', ["$state", "PatientDAO", "PatientRecordDAO", "Page", "$rootScope", "$timeout", "$modal", PatientRecordsCtrl]);
})();
