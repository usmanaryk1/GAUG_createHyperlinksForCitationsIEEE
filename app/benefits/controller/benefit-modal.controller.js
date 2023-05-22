/* global ontime_data, _ */

(function () {
    function BenefitModalCtrl(selectedType, benefitPackageLineSet, editMode, $modalInstance, $timeout) {
        var ctrl = this;
        ctrl.parameters = {};
        ctrl.days = [1,2,3,4,5,6,7,8,9,10,
                        11,12,13,14,15,16,17,18,19,20,
                        21,22,23,24,25,26,27,28,29];
                    
        if (selectedType !== null) {
            ctrl.selectedBenefitObj = selectedType[0];
            ctrl.modalTitle = ontime_data.benefitMap[ctrl.selectedBenefitObj];
            if (_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj})) {
                ctrl.parameters = angular.copy(_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}));
                if(ctrl.parameters.expirationRequired)
                    ctrl.parameters.expirationRequired = ctrl.parameters.expirationRequired.toString();
            } else {
                ctrl.parameters.lineType = selectedType[0];
            }

            ctrl.editMode = editMode;
        }
        
        ctrl.getDaysCount = function (num) {
            return new Array(num);
        };
        
        

        $timeout(function () {
            cbr_replace();
        });

        ctrl.save = function () {
            if ($('#benefit_model_form')[0].checkValidity()) {
                ctrl.parameters.isDeleted = false;
                if (ctrl.parameters.expirationDay)
                    ctrl.parameters.expirationDay = parseInt(ctrl.parameters.expirationDay);
                if (_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj})) {
                    $modalInstance.close({reverse: true, benefitPackageLineSet: _.map(benefitPackageLineSet, function (lineTypeObj) {
                            return ctrl.parameters.lineType === lineTypeObj.lineType ? ctrl.parameters : lineTypeObj;
                        })});
                } else {
                    benefitPackageLineSet.push(ctrl.parameters);
                    console.log("benefitPackageLineSet", benefitPackageLineSet, "ctrl.parameters", ctrl.parameters);
                    $modalInstance.close({reverse: false, benefitPackageLineSet: benefitPackageLineSet});
                }
            }          
        };

        ctrl.remove = function () {
            ctrl.parameters.isDeleted = true;
            if (ctrl.parameters.id) {
                $modalInstance.close({reverse: false, benefitPackageLineSet: _.map(benefitPackageLineSet, function (lineTypeObj) {
                        return ctrl.parameters.lineType === lineTypeObj.lineType ? ctrl.parameters : lineTypeObj;
                    })});
            } else {
                $modalInstance.close({reverse: false, benefitPackageLineSet: _.remove(benefitPackageLineSet, function (lineTypeObj) {
                        return ctrl.parameters.lineType !== lineTypeObj.lineType;
                    })});
            }
        };

        ctrl.cancel = function () {
            //reverse the action.
            $modalInstance.close({reverse: true});
        };
    }
    ;

    angular.module('xenon.controllers').controller('BenefitModalCtrl', ["selectedType", "benefitPackageLineSet", "editMode", "$modalInstance", "$timeout", BenefitModalCtrl]);
})();