/* global ontime_data, _ */

(function () {
    function BenefitModalCtrl(selectedType, benefitPackageLineSet, editMode, $modalInstance, $timeout) {
        var ctrl = this;
        ctrl.parameters = {};
        ctrl.days29 = [1,2,3,4,5,6,7,8,9,10,
                        11,12,13,14,15,16,17,18,19,20,
                        21,22,23,24,25,26,27,28,29];
                    
        ctrl.days30 = ctrl.days29.concat([30]);           
        
        ctrl.days31 = ctrl.days30.concat([31]);
        
        ctrl.changeDays = function(){
            if(ctrl.parameters.expirationMonth && ctrl.parameters.expirationMonth != 2){
                if(['1','3','5','7','8','10','12'].indexOf(ctrl.parameters.expirationMonth) > -1){
                    ctrl.days = ctrl.days31;
                }else{
                    ctrl.days = ctrl.days30;
                    if(ctrl.parameters.expirationDay == 31)
                        delete ctrl.parameters.expirationDay;
                }
            }else{
                ctrl.days = ctrl.days29;
                if(ctrl.parameters.expirationDay == 30 || ctrl.parameters.expirationDay == 30)
                    delete ctrl.parameters.expirationDay;
            }
        };
                    
        if (selectedType !== null) {
            ctrl.selectedBenefitObj = selectedType[0];
            if(ctrl.selectedBenefitObj=='SIT' || ctrl.selectedBenefitObj=='PRT' || ctrl.selectedBenefitObj == 'VCT'){
                ctrl.parameters['expirationRequired'] = 'false';
            }
            if(ctrl.selectedBenefitObj=='HEC' || ctrl.selectedBenefitObj=='WFC' || ctrl.selectedBenefitObj == '401'){
                ctrl.parameters['employerContributionType'] = 'F';
            }
            ctrl.modalTitle = ontime_data.benefitMap[ctrl.selectedBenefitObj];
            if (_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj})) {
                ctrl.parameters = angular.copy(_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}));
                if(typeof ctrl.parameters.expirationRequired !== 'undefined')
                    ctrl.parameters.expirationRequired = ctrl.parameters.expirationRequired.toString();
                if(ctrl.parameters.expirationMonth)
                    ctrl.changeDays();
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
                if(ctrl.parameters.expirationRequired === "false"){
                    delete ctrl.parameters.expirationDay;
                    delete ctrl.parameters.expirationMonth;                    
                }else{
                    if (ctrl.parameters.expirationDay)
                        ctrl.parameters.expirationDay = parseInt(ctrl.parameters.expirationDay);
                }                
                if (_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}) && _.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}).isDeleted === false) {
                    $modalInstance.close({reverse: true, benefitPackageLineSet: _.map(benefitPackageLineSet, function (lineTypeObj) {
                            return ctrl.parameters.lineType === lineTypeObj.lineType ? ctrl.parameters : lineTypeObj;
                        })});
                } else if (_.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}) && _.find(benefitPackageLineSet, {lineType: ctrl.selectedBenefitObj}).isDeleted === true) {
                    $modalInstance.close({reverse: false, benefitPackageLineSet: _.map(benefitPackageLineSet, function (lineTypeObj) {
                            return ctrl.parameters.lineType === lineTypeObj.lineType ? ctrl.parameters : lineTypeObj;
                        })});
                } else {
                    benefitPackageLineSet.push(ctrl.parameters);
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
        
        //to make the radio buttons selected, theme bug
            setTimeout(function () {
                cbr_replace();
            }, 100);
    };
    
    angular.module('xenon.controllers').controller('BenefitModalCtrl', ["selectedType", "benefitPackageLineSet", "editMode", "$modalInstance", "$timeout", BenefitModalCtrl]);
})();