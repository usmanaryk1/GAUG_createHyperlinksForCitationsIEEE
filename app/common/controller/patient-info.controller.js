(function () {
    function PatientInfoCtrl(patientId,insuranceProviderMap,nursingCareMap,staffCoordinatorMap,$rootScope,$modal,$modalInstance,PatientDAO) {
        var ctrl = this;
        
        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        ctrl.patient = {};
        $rootScope.maskLoading();
        PatientDAO.getPatientsForSchedule({patientIds: patientId, addressRequired: true}).then(function (patients) {
                var patient = patients[0];
                ctrl.patient = angular.copy(patient);
                ctrl.patient.insuranceProviderName = insuranceProviderMap[patient.insuranceProviderId];
                ctrl.patient.nurseCaseManagerName = nursingCareMap[patient.nurseCaseManagerId];
                ctrl.patient.staffingCordinatorName = staffCoordinatorMap[patient.staffingCordinatorId];
                if (patient.languagesSpoken != null && patient.languagesSpoken.length > 0) {
                    ctrl.patient.languagesSpoken = patient.languagesSpoken.split(",");
                }
                $rootScope.unmaskLoading();
            });
                                
        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('PatientInfoCtrl', ["patientId","insuranceProviderMap","nursingCareMap","staffCoordinatorMap","$rootScope", "$modal","$modalInstance","PatientDAO", PatientInfoCtrl]);
})();