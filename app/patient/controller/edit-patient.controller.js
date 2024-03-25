(function () {
    function PatientEditCtrl($rootScope, PatientDAO, $state, $http, $sce, $window, $timeout, $scope) {
        'use strict';
        var ctrl = this;
        ctrl.formUrl = ''
        ctrl.patientName;
        ctrl.patient = {}
        ctrl.recordType = $state.params.recordType
        ctrl.recordTypesObj = angular.copy(ontime_data.patientRecordsObj)
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

            if (ctrl.recordType == 'Nursing_Assessment') 
                ctrl.formUrl = appHelper.mockDataPath('patients/nursing_assessment_form.json')
             else if (ctrl.recordType == 'Progress_Note')
                ctrl.formUrl = appHelper.mockDataPath('patients/progress_note_form.json')
             else if (ctrl.recordType == 'Medication_Reconciliation')
                ctrl.formUrl = appHelper.mockDataPath('patients/medication_reconciliation_form.json')

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
            $http.get(ctrl.formUrl).then(async function (res) {
                // console.log("getFormData ctrl.formUrl, res.data ", ctrl.formUrl, res.data);
                ctrl.formDefinition = await res.data;
                // console.table(ctrl.formDefinition);
                ctrl.makeFormData()
                ctrl.fillauto();
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

        ctrl.fillauto = function () {
            var dynamicLanguageData = {
                "English": true,
                "Creole": true,
                "Urdu": true,
                "Other": true
                // ... (other languages)
            };

            var other_language_value= "fhgsdhgshsdghd other";

            ctrl.formDefinition[8].options.forEach(function (option) {
                var language = option.title;
                option.checked = dynamicLanguageData[language];
            });

            ctrl.formDefinition[8].options.find(option => {
                if(option.value === "Other"){
                    ctrl.showSubField(option);
                    ctrl.subFields[option.subfield.name] = other_language_value
                    // console.log("option.subfield.value",option.subfield.value,  ctrl.formDefinition[8].options);
                }
            }
                
                
                )
                //.subfield.value = other_language_value;
                    //ctrl.showSubField(option);
        
        
            console.log("seee", ctrl.formDefinition, ctrl.formDefinition[8].options)
    }

        ctrl.makeFormData = function () {
            angular.forEach(ctrl.formDefinition, function (field) {
                switch (field.type) {
                    case 'text':
                    case 'date':
                    case 'select':
                    case 'textarea':
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
                    case 'multigroup':
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
                    console.log("option.checked",option.checked);
                    // ctrl.showSubField(option);

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

        ctrl.tagsGenerator = function (field) {
            ctrl.formData[field.name] = [];
        }

        ctrl.tagsCreated = function (event, fieldName) {
            if (event.keyCode == 13) {
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
            console.log("change call", option);
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
            console.warn("submitForm",obj);
            console.error($('#edit_patient_form')[0].checkValidity());

            if($('#edit_patient_form')[0].checkValidity()){

                console.log("#edit_patient_form",obj);
            }
        };

        ctrl.sanitizeHtml = function (htmlContent) {
            const trustedHtml = $sce.trustAsHtml(htmlContent);
            const sanitizedHtml = angular.element('<div>').html(trustedHtml).text(); // Convert to string
            const htmlWithLineBreaks = sanitizedHtml.replace(/\n/g, '<br>');

            return $sce.trustAsHtml(htmlWithLineBreaks);

        };

        ctrl.setMaxDate = function (days) {
            // Filter or Directive could also be used
            var currentDate = new Date();
            var maxDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
            return maxDate.toISOString().split('T')[0];
        }
    };
    angular.module('xenon.controllers').controller('PatientEditCtrl', ["$rootScope", "PatientDAO", "$state", "$http", "$sce", "$window", "$timeout", "$scope", PatientEditCtrl]);
})();






var nursingAssessment=
[
  {
  visit_date: "01/10/2024",
  assesment_type: "initial_assessment",
  assessment_conducted: "field",
  covid_screening: [
    "completed_with_patient",
    "completed_with_aide",
    "other"
  ],
  covid_vaccine: "yes",
  hx_covid: "yes",
  aide: {
    preseent_during_assessment: false,
    not_present: false,
    aide_notified: false,
    aide_already_aware: false,
    done_with_supervisor: false
  },
  aide_education_completed: {
    aide_educ_complete: true
  },
  languages: {
    english: true,
    spanish: false,
    other_language: true
  },
  required_interpreter: "yes",
  emergency_contact_name: "dsdfsdfds",
  emergency_contact_number: "56546456345656",
  emergency_contact_relation: "friend",
  live_with: "spouse",
  pets: "yes",
  dnr: "unknown",
  hospice_name: "fghsdfgfdg",
  hospice_number: "dgfdgdfgs",
  can_patient_be_alone: "no",
  bp: {
    enter_value_bp: true,
    uto_telephonic: false
  },
  pulse: {
    enter_value_pulse: true,
    uto_telephonic: false
  },
  respiratory: {
    enter_value_respiratory: false,
    uto_telephonic: false
  },
  temperature: {
    enter_value_temp: true,
    oral: true,
    tympanic: true,
    uto_telephonic: false
  },
  weight: {
    enter_value_weight: true,
    reported: false,
    actual: false,
    uto_telephonic: true
  },
  grasp_right: "not_equal",
  grasp_left: "equal",
  neurological: {
    headache: false,
    vertigo: false,
    weakness: false,
    seizures: false,
    tremor: false,
    aphasia: false,
    paralysis: false,
    slurred_speech: true,
    short_term_memory_loss: false,
    long_term_memory_loss: false,
    non_verbal: false,
    other: true,
    comments: true
  },
  cardiopulmonary: [
    "night_sweats",
    "comments",
    "face_mask"
  ],
  vision: [
    "comments",
    "glasses"
  ],
  hearing: [
    "deaf",
    "comments"
  ],
  musculoskeletal: [
    "splint",
    "comments"
  ],
  endocrine: [
    "other",
    "comments"
  ],
  gastrointestinal: [
    "ostomy_care_performed_by",
    "melena"
  ],
  oral: [
    "comments"
  ],
  diet: {
    regular: false,
    special_low_fat: false,
    special_low_salt: false,
    special_low_sugar: false,
    fluid_restrictions: false,
    supplements: false,
    peg_tube: false,
    ng_tube: false,
    pureed: false,
    chopped: false,
    other: true
  },
  meals_prepared_by: {
    undefined: true
  },
  feeding: [
    "oral",
    "gastric_tube"
  ],
  nutritional_risks: {
    on_diet: false,
    open_wound: false,
    live_for_shopping: false,
    fluid_restricted_diet: true,
    oral_dental_problems: true,
    feeding_other: true,
    eats_less_than_2_meals_per_day: false,
    loss_weight_in_past_6_months: false,
    more_than_3_medications: true,
    takes_more_than_2_drinks: false,
    total_score: 5
  },
  genitourinary: {
    incontinence_of_bladder: false,
    frequency: false,
    urgency: false,
    odor: false,
    hematuria: false,
    nocturia: false,
    catheter: false,
    comments: false
  },
  skin: {
    rash: false,
    itching: false,
    ecchymosis: false,
    abrasion: false,
    surgical_wound: false,
    wound: false,
    wound_care_provided_by: false,
    wound_care_followup_needed: false,
    comments: false
  },
  patient_pain: "yes",
  noted_pain: "yes",
  pain_scale: 8,
  pain_medications: "no",
  describe_pain: {
    unable_to_report: false,
    throbbing: false,
    aching: false,
    sharp: false,
    burning: false,
    dull: false,
    other: false,
    N_A: true // N/A cannot assign chanhe N/A into N_A
  },
  pain_aggravation: "describe",
  pain_relief: "no",
  functional_assessment: {
    assistance_with_adls: false,
    assistance_with_iadls: false
  },
  functional_limitations: {
    dyspnea: false,
    amputation: false,
    hearing: false,
    vision: false,
    speech: false,
    endurance: false,
    bladder_incontinence: false,
    bowel_incontinence: false,
    adl: false,
    ambulation: false,
    other: false
  },
  fall_risk_assessment: {
    age_over_65: false,
    diagnosed_conditions: true,// diagnosed conditions into diagnosed_conditions
    prior_history_of_falls_within_3_months: false,
    fall_rist_incontinence: true,
    visual_impairment: false,
    environmental_hazards: true,
    polypharmacy: false,
    pain_affecting_level_of_function: false,
    cognitive_impairment: false,
    total_score: 7
  },
  therapty_service: "yes",
  recent_fall: "yes",
  allergies: "enter_allergies",
  diagnosis: [], //tags issue not bint value see that? //need ro replace with swipe //2115
  medications: [
    {
      med_names: "dns",
      dosage: "sss",
      frequency: "ddd",
      route: "ffff",
      purpose: "gggg",
      $$hashKey: "159"
    },
    {
      med_names: "pain",
      dosage: "dtgreg",
      frequency: "dsgsd",
      route: "sdg",
      purpose: "sdgfd",
      $$hashKey: "1LD"
    }
  ],
  client_can_administrate_medicine: "yes",
  client_needs_medications: "yes",
  client_compliant_with_regimen: "yes",
  who_was_taught: {
    patient: false,
    aide: false,
    pcg: false,
    other: false
  },
  instructions_provided: {
    verbal_instructions_provided: false,
    demonstration: false,
    education_handouts_provided: false
  },
  response: {
    return_observation_reserved: false,
    understanding_verbalized: false,
    comments: false
  },
  educated_to_remind_patient: {
    yes: false
  },
  season_flu_immunization: {
    yes: false,
    no: false,
    education_provided: false
  },
  pneumococcal_vaccine: {
    yes: false,
    no: false,
    education_provided: false
  },
  eye_exam: "no",
  hearing_exam: "yes",
  dental_exam: "no",
  breast_exam: "education_provided",
  last_pcp_visit: "date",
  next_pcp_visit: "unknown",
  recent_hospitalizations: "date",
  education_on_benefits: {
    yes: false
  },
  dme_supplies: {
    wheelchair: false,
    crutches: false,
    commode: false,
    shower_chair: false,
    nebulizer: false,
    glucometer: false,
    walker: false,
    sliding_board: false,
    urinal: false,
    hospital: false,
    concentrator_02: false, //cannot start from number 02_concentrator into concentrator
    grab_bars: false,
    cane: false,
    prosthesis: false,
    bedpan: false,
    hoyer_lift: false,
    pers: false,
    other: false
  },
  environmental_risks: {
    elevator: "N/A",
    firescape_secondary: "N/A",
    rug_secure: "N/A",
    sharps_container_disposal: "no",
    unobstructed_stairs: "N/A",
    safe_environemt_for_oxygen: "N/A",
    oxygen_in_home: "N/A",
    loca_companies_notified: "yes",
    sanitary_for_provision: "N/A",
    adequate_lighting: "N/A",
    electrical_hazards: "N/A",
    can_access_emergency_services: "N/A",
    equiptment_supplies: "N/A",
    medicine_labeled: "yes",
    functioning_smoke_alarm: "N/A",
    functioning_co_alarm: "N/A",
    working_utilities: "N/A"
  },
  other_environmental: {
    vermin_infestation: false,
    other_hazards_or_concerns: false,
    education_regarding_safety: false
  },
  live_in_accomodation: {
    not_live_in_case: false, // cannot assign / cgange N/A into N_A
    rn_noted_appropriate: false,
    aide_reported_appropriate: false,
    inappropriate_repot_to_ontime: false
  },
  special_precations: {
    safety_considerations_precautions: false,
    pain: false,
    aspiration_choking_precautions: false,
    dizziness: false,
    sharps_precautions: false,
    injuries_bruising_skin_breakdown: false,
    burning_on_urination_cloudy_foul_smelling_urine: false,
    seizure_precautions: false,
    feeding_tube_precautions: false,
    elopement_risk: false,
    fall_safety_precautions: false,
    bleeding_precautions: false,
    oxygen_precautions: false,
    hypo_hyperglycemia_symptoms: false
  },
  assesment_summary_checklist: {
    plan_of_care: false,
    discharge_planning: false,
    plan_for_next_visit: false
  },
  covid_screening_other_value: "vxzvxcvzx",
  covid_vaccine_date: "2024-01-02",
  other_language_value: "lang",
  required_interpreter_name: "efsadfasfd",
  pets_type: "dogs",
  bp_value: "fffffff",
  pulse_value: "ffddddd",
  temp_value: "fdsgsfdg",
  weight_value: "dsgdfgs",
  grasp_right_not_equal: "fsdgsdg",
  neurological_other: "dfgsdgsdg",
  neurological_comments: "dfgsdfgdfgsd",
  cardiopulmonary_comments: "vcvvvv",
  vision_comments: "vvvvvv",
  hearing_comments: "vvvvvvvv",
  musculoskeletal_comments: "vvvvv",
  endocrine_other_value: "vvvv",
  endocrine_comments: "vvvvvvv",
  ostomy_care_performed_by_value: "sdfsadf",
  oral_comments_value: "sdfsdfas",
  diet_other_value: "dfsddgd",
  meals_prepared_by_other_value: "dsssss",
  genitourinary_comments: "dfadfas",
  skin_comments: "dasfasdfsfsd",
  patient_pain_yes_value: "dsfsdf",
  pain_aggravation_describe_value: "ddddd",
  functional_limitations_other_value: "sdsds",
  recent_fall_yes_value: "vvsdfsd",
  allergies_enter_allergies_value: "fdsg43454353",
  who_was_taught_other_value: "gsdfgfg",
  resposne_comments: "dsgsdg",
  pneumococcal_vaccine_no_value: "dfsgsdfdg",
  season_flu_immunization_no_value: "sdgsdgdfg",
  eye_exam_no_value: "dfsgdfgs",
  dental_exam_no_value: "sdfgsdgs",
  undefined: "",
  breast_exam_no_value: "",
  last_pcp_visit_date_value: "2024-01-03",
  recent_hospitalizations_date_value: "2024-01-03",
  dme_supplies_other_value: "sdfg",
  other_environmental_other_hazards_or_concerns_value: "sdgsdfg",
  other_environmental_vermin_infestation_value: "sdfgfdgs",
  plan_for_next_visit_value: "zzZCZCz"
}
]