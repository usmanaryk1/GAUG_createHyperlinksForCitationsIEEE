(function () {
  function HomeCarePlanCtrl(
    $rootScope,
    $formService,
    $filter,
    PatientDAO,
    PatientRecordDAO,
    HomeCarePlanDAO,
    $state,
    $stateParams,
    $http,
    $sce,
    $window,
    $timeout,
    $scope
  ) {
    "use strict";
    var ctrl = this;
    ctrl.patientId = $state.params.id;
    ctrl.patientName;
    ctrl.params = $stateParams;

    ctrl.currentDate = new Date();
    ctrl.currentDateWithFormat = $filter("date")(
      ctrl.currentDate,
      "MM/dd/yyyy"
    );

    ctrl.clearPatientProxySignatureCall = clearPatientProxySignature;
    ctrl.clearNurseSignatureCall = clearNurseSignature;

  // Initialize form data
  ctrl.homeCarePlanForm = {
    position: "",
    tasks: [],
    goals: [],
    canBeLeftAlone: 'true',
    emergencyContact: {
      phoneNumber: "",
      name: "",
    },
    patientProxySignature: null,
    nurseSignature: null,
    // Add other fields as needed
  };

  // Sample data for tasks and goals
  ctrl.tasks = [
    { name: "Task 1" },
    { name: "Task 2" },
    // Add more tasks as needed
  ];

  ctrl.goals = [
    { name: "Fall & Injury Prevention" },
    { name: "Hospitalization Reduction" },
    { name: "Personal Care Needs Will Be Met" },
    { name: "Rehabilitation" },
    { name: "Social & Recreational Activities Met" },
    // Add more goals as needed
];
  // Sample data for position options
  ctrl.positionOptions = [
    "Position 1",
    "Position 2",
    // Add more positions as needed
  ];

  // Function to submit the form
  ctrl.submitForm = function () {
    // Implement form submission logic here
    var medicalOrderFormToSave = angular.copy(ctrl.homeCarePlanForm);
    //   // signature
    //   medicalOrderFormToSave.signature = medicalOrderFormToSave.signature
    //   ? medicalOrderFormToSave.signature.substring(
    //       medicalOrderFormToSave.signature.indexOf(",") + 1
    //     )
    //   : null;

    console.log("Home Care Plan Form Submitted", ctrl.homeCarePlanForm);

  };




 
    function clearPatientProxySignature() {
        ctrl.homeCarePlanForm.patientProxySignature = "";
      }
    function clearNurseSignature() {
        ctrl.homeCarePlanForm.nurseSignature="";
      }


    // ctrl.generateFormCall = generateForms;

    // ctrl.homeCarePlanForm = {
    //   orders: [{ discipline: "", frequency: "", duration: "" }],
    // };

    // ctrl.addhomeCarePlan = function () {
    //     console.log("add");
    //   ctrl.homeCarePlanForm.orders.push({
    //     discipline: "",
    //     frequency: "",
    //     duration: "",
    //   });
    // };

    // ctrl.removehomeCarePlan = function (index) {
    //   ctrl.homeCarePlanForm.orders.splice(index, 1);
    // };

    // /*================   FUNCTION CALLS   ===================*/
    // ctrl.generateFormCall();

    // /*================   FORM FUNCTIONS   ===================*/
    // function generateForms() {
    //   $rootScope.isFormDirty = false;
    //   if (ctrl.params?.id) {
    //     $rootScope.maskLoading();
    //     PatientDAO.get({ id: $state.params.id }).then(function (res) {
    //       ctrl.patient = res;
    //       ctrl.patientName = res.fName;
    //       ctrl.homeCarePlanForm = {
    //         orders: res?.orders
    //           ? res?.orders
    //           : [{ discipline: "", frequency: "", duration: "" }],
    //       };

    //       $rootScope.unmaskLoading();
    //     });
    //   } else {
    //     ctrl.homeCarePlanForm = {
    //       orders: [{ discipline: "", frequency: "", duration: "" }],
    //     };
    //     //   setTimeout(function () {
    //     //     $formService.resetRadios();
    //     //   }, 100);

    //     setupWatch();
    //   }
    // }

    // function setupWatch() {
    //     $scope.$watch(
    //       function () {
    //         return ctrl.homeCarePlanForm;
    //       },
    //       function (newValue, oldValue) {
    //         if (newValue != oldValue) {
    //           $rootScope.isFormDirty = true;
    //         }
    //       },
    //       true
    //     );
    //   }

  }
  angular
    .module("xenon.controllers")
    .controller("HomeCarePlanCtrl", [
      "$rootScope",
      "$formService",
      "$filter",
      "PatientDAO",
      "PatientRecordDAO",
      "HomeCarePlanDAO",
      "$state",
      "$stateParams",
      "$http",
      "$sce",
      "$window",
      "$timeout",
      "$scope",
      HomeCarePlanCtrl,
    ]);
})();
