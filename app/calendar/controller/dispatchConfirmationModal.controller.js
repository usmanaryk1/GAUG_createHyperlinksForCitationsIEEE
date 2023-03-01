(function () {
    var dispatchConfirmModalController = function ($modalInstance, patientId, PatientDAO) {
        var ctrl = this;
        ctrl.ok = function () {
            $modalInstance.close(ctrl.careType);
        };
        ctrl.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        PatientDAO.getPatientsForSchedule({patientIds: patientId}).then(function (res) {
            var patientObj = res[0];
            if (patientObj && patientObj.patientCareTypeCollection && patientObj.patientCareTypeCollection.length > 0) {
                var careTypesSelected = [];
                var length = patientObj.patientCareTypeCollection.length;
                var str = "";
                for (var i = 0; i < length; i++) {
                    careTypesSelected.push(patientObj.patientCareTypeCollection[i].insuranceCareTypeId.companyCaretypeId);
                    if (str.length > 0) {
                        str = str + ",";
                    }
                    str = str + patientObj.patientCareTypeCollection[i].insuranceCareTypeId.companyCaretypeId.id;
                }
                ctrl.careTypes = careTypesSelected;
                ctrl.careType = ctrl.careTypes[0].id;
            }
        });
    };
    angular.module('xenon.controllers').controller('DispatchConfirmModalController', ['$modalInstance', 'patientId', 'PatientDAO', dispatchConfirmModalController]);
})();