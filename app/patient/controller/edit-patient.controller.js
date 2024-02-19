(function () {
    function PatientEditCtrl($rootScope, PatientDAO, $state, $http, $sce, $window, $timeout, $scope) {
        'use strict';
        const formUrl = appHelper.assetPath('json/patient_form.json');
        var ctrl = this;
        ctrl.patientName;
        ctrl.patient = {}
        ctrl.recordType = $state.params.recordType
        ctrl.currentDate = new Date();
        ctrl.formDefinition = []
        ctrl.formData = {};
        ctrl.selectedRadios = {};
        ctrl.subFields = {}; // Responsible for sending data in FormData
        ctrl.checkBoxSubs = {}; // Keeps track of showing subfields
        ctrl.checkBoxes = {}
        ctrl.showSibs = {};
        ctrl.oneSelectors = {}
        ctrl.listChecks = {}
        ctrl.previousRadio = {} // Responsible for previous radio buttons to be removed from formdata when some other is selected
        ctrl.pageInitCall = pageInit;
        ctrl.tagsObj = {}
        ctrl.getFormDataCall = getFormData;

        function pageInit() {
            $rootScope.maskLoading();
            PatientDAO.get({ id: $state.params.id }).then(function (res) {
                ctrl.patient = res;
                ctrl.patientName = res.fName
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
            ctrl.getFormDataCall();
        }

        /*================   FORM BUILDER   ===================*/
        function getFormData() {
            $http.get(formUrl).then(async function (res) {
                ctrl.formDefinition = await res.data;
                ctrl.makeFormData()
            }).catch(function (data, status) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                });
                toastr.error("Failed to load form");
                $window.history.back();
            })
        }

        ctrl.makeFormData = function () {
            angular.forEach(ctrl.formDefinition, function (field) {
                switch (field.type) {
                    case 'text':
                    case 'date':
                    case 'select':
                        ctrl.formData[field.name] = '';
                        break;
                    case 'number':
                        ctrl.formData[field.name] = 0;
                        break;
                    case 'radiocheck':
                        setRadiosChecks(field)
                        break;
                    case 'listing':
                        createScoreListing(field)
                        break;
                    case 'nestedarray':
                        ctrl.createNestedArray(field)
                        break;
                        case 'tags':
                            ctrl.tagsGenerator(field);
                    default:
                        break;
                }
            });
        }

        function setRadiosChecks(field) {
            if (field.subtype == 'radio') {
                const selected = field.options.find(option => option.selected);
                ctrl.formData[field.name] = selected ? selected.value : '';
                ctrl.selectedRadios[field.name] = selected ? selected.value : '';
            }
            if (field.subtype == 'checkbox') {
                if (field.dbType === 'array') {
                    ctrl.formData[field.name] = [];
                    return
                }
                ctrl.formData[field.name] = {};
                angular.forEach(field.options, option => {
                    ctrl.formData[field.name][option.value] = Boolean(option.checked);
                });
            }
        }

        function createScoreListing(field) {
            if (field.dbType === 'array') {
                ctrl.formData[field.name] = [];
                return
            }
            ctrl.formData[field.name] = {};
            field.options.forEach(option => {
                ctrl.formData[field.name][option.value] = false;
            });

            if (field.subtype == 'radioselector') {
                angular.forEach(field.options, option => {
                    const selected = option.suboptions.find(opt => opt.selected);
                    ctrl.formData[field.name][option.value] = selected ? selected.value : undefined;
                });
            }
        }

        ctrl.createNestedArray = function (field, action) {
            if (!angular.isArray(ctrl.formData[field.name]))
                ctrl.formData[field.name] = [];
            if (action) {
                ctrl.formData[field.name].splice(-1);
                return;
            }
            let newObj = {};
            angular.forEach(field.options, option => {
                newObj[option.value] = ''
            })
            ctrl.formData[field.name].push(newObj);
        }

        ctrl.tagsGenerator = function (field){
            ctrl.formData[field.name] = [];
        }

        ctrl.tagsCreated = function (event, fieldName){
            if(event.keyCode == 13){
                ctrl.formData[fieldName].push(ctrl.tagsObj[fieldName])
                ctrl.tagsObj[fieldName] = ''
            }
        }

        ctrl.pageInitCall();

        ctrl.radioChanged = function (fieldName, option, value) {
            const previousRadio = ctrl.previousRadio;
            if (option.subfield) {
                ctrl.subFieldChanged(option.subfield?.name)
                previousRadio[fieldName] = option.subfield?.name
            } else {
                ctrl.subFieldChanged(previousRadio[fieldName], '', true)
            }
        };

        ctrl.groupCaller = function (members) {
            const { selectedRadios, checkBoxes } = ctrl;
            angular.forEach(members, member => {
                if (member.checktype === 'radio') {
                    selectedRadios[member.name] = member.value;
                } else if (member.checktype === 'checkbox') {
                    checkBoxes[member.id] = true;
                    ctrl.handleCheckboxChange(true, member.dbType, member.name, { value: member.subfield });
                }
            });
        }

        ctrl.handleCheckboxChange = function (value, type, fieldName, option) {
            const arr = ctrl.formData[fieldName];
            const showSibs = ctrl.showSibs;
            if (type == 'array') {
                const index = arr.indexOf(option.value);
                if (index != -1) {
                    arr.splice(index, 1);
                } else {
                    arr.push(option.value);
                }
            }
            else if (type == 'object') {
                arr[option.value] = value
            }

            if (option.siblings) {
                const sibs = option.siblings.split(',');
                angular.forEach(sibs, sib => {
                    if (sib in showSibs)
                        delete showSibs[sib];
                    else
                        showSibs[sib] = sib;
                })
            }
        }

        ctrl.oneSelectorChanged = function (id, value, field) {
            if (value) {
                ctrl.formData[field.name] = { [id]: true }
                field.options.forEach(option => {
                    ctrl.checkBoxes[option.id] = false
                    if (option.id in ctrl.checkBoxSubs)
                        ctrl.showSubField(option)
                })
            } else {
                ctrl.formData[field.name] = field.dbType === 'object' ? {} : [];
                const optionsArr = ctrl.formData[field.name];                
                field.options.forEach(option => {
                    optionsArr[option.value] = false;
                })
            }
        }

        /*================   SUB FIELDS   ===================*/
        ctrl.showSubField = function (option) {
            const checkBoxSubsArr = ctrl.checkBoxSubs;
            if (option.id in checkBoxSubsArr) {
                delete checkBoxSubsArr[option.id];
                ctrl.subFieldChanged(option.subfield?.name, '', true)
            }
            else {
                checkBoxSubsArr[option.id] = option.id;
                ctrl.subFieldChanged(option.subfield?.name)
            }
        }

        ctrl.subFieldChanged = function (subfieldName, value, check) {
            const subFields = ctrl.subFields;
            if (check && subfieldName in subFields) {
                delete subFields[subfieldName];
            } else {
                subFields[subfieldName] = value || '';
            }
        }

        ctrl.resetForm = function () {
            ctrl.formData = {};
            ctrl.selectedRadios = {};
            ctrl.subFields = {}; 
            ctrl.checkBoxSubs = {}; 
            ctrl.checkBoxes = {}
            ctrl.showSibs = {};
            ctrl.oneSelectors = {}
            ctrl.listChecks = {}
            ctrl.previousRadio = {}
            ctrl.makeFormData()
        }

        /*================   LIST FUNCS   ===================*/
        ctrl.listCheckChanged = function (value, option, field) {
            const { listChecks } = ctrl;
            const formDataListChecks = ctrl.formData[field.name];
            if (option.value in listChecks) {
                delete listChecks[option.value];
                formDataListChecks[field.total] -= option.points;
            } else {
                listChecks[option.value] = value;
                formDataListChecks[field.total] = (formDataListChecks[field.total] || 0) + option.points;
            }
            formDataListChecks[option.value] = value;
        };

        ctrl.submitForm = function () {
            const obj = { ...ctrl.formData, ...ctrl.selectedRadios, ...ctrl.subFields }
            // HERE IS THE OUTPUT OBJECT WITH KEY VALUE PAIRS
        };

        ctrl.sanitizeHtml = function (htmlContent) {
            return $sce.trustAsHtml(htmlContent).replace(/\n/g, '<br>');
        };

        ctrl.setMaxDate = function(days) {
            // Filter or Directive could also be used
            var currentDate = new Date();
            var maxDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
            return maxDate.toISOString().split('T')[0];
          }
    };
    angular.module('xenon.controllers').controller('PatientEditCtrl', ["$rootScope", "PatientDAO", "$state", "$http", "$sce", "$window", "$timeout", "$scope", PatientEditCtrl]);
})();


