(function () {
  function HomeCarePlanCtrl(
    $rootScope,
    $formService,
    $filter,
    PositionDAO,
    TasksDAO,
    PatientDAO,
    PatientRecordDAO,
    HomeCarePlanDAO,
    $state,
    $stateParams,
    $http,
    $sce,
    $window,
    $timeout,
    $scope,
    $modal
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

    ctrl.goals = [
      { name: "Fall & Injury Prevention" },
      { name: "Hospitalization Reduction" },
      { name: "Personal Care Needs Will Be Met" },
      { name: "Rehabilitation" },
      { name: "Social & Recreational Activities Met" },
  ];

    ctrl.positionList = [];
    ctrl.retrievePositions = retrievePositionsData;
    
    ctrl.taskList = [];
    ctrl.retrieveTasks = retrieveTasksData;
    var avoidWatch = true;
    ctrl.selectedTasks = [];
    ctrl.tasksErrorMsg = null;
    ctrl.isTasksSelected= false;

    ctrl.clearPatientProxySignatureCall = clearPatientProxySignature;
    ctrl.clearNurseSignatureCall = clearNurseSignature;

    ctrl.homeCarePlanFormName={};//form validation
    ctrl.homeCarePlanForm = {}
    ctrl.generateFormCall = generateForms;


    /*================   FUNCTION CALLS   ===================*/
    ctrl.retrievePositions();
    ctrl.retrieveTasks();
    ctrl.generateFormCall();

    /*================   FORM FUNCTIONS   ===================*/
    function generateForms() {
      $rootScope.isFormDirty = false;
      if (ctrl.params?.id) {
        // $rootScope.maskLoading();
        // PatientDAO.get({ id: $state.params.id }).then(function (res) {
        //   ctrl.patient = res;
        //   ctrl.patientName = res.fName;
        //   ctrl.homeCarePlanForm = {
        //     orders: res?.orders
        //       ? res?.orders
        //       : [{ discipline: "", frequency: "", duration: "" }],
        //   };

        //   $rootScope.unmaskLoading();
        // });
      } else {
          // Initialize form data
          ctrl.homeCarePlanForm = {
            position: "",
            taskScheduleSet: [], // Added array to store task schedules
            goals: "",
            canBeLeftAlone: 'true',
            emergencyContact: {
              phoneNumber: "",
              name: "",
            },
            patientProxySignature: null,
            nurseSignature: null,
          };

        setupWatch();
      }
    }

  //All task lists reterives
  function retrieveTasksData() {
    TasksDAO.view({subAction: 'all'}).then(function(res) {
        showLoadingBar({
            delay: .5,
            pct: 100,
            finish: function() {
            }
        }); // showLoadingBar
        ctrl.taskList = res;
        delete ctrl.taskList["$promise"];
        delete ctrl.taskList["$resolved"];
        // console.log("ctrl.taskList", res);
    }).catch(function(data, status) {
        toastr.error("Failed to retrieve tasks.");
        showLoadingBar({
            delay: .5,
            pct: 100,
            finish: function() {

            }
        }); // showLoadingBar
    }).then(function() {
        $rootScope.unmaskLoading();
        $timeout(function () {
          $('#tasks').multiSelect('refresh');
      });
    });
}

function retrievePositionsData(){
  PositionDAO.view({subAction: 'all'}).then(function (res) {
      showLoadingBar({
          delay: .5,
          pct: 100,
          finish: function () {
          }
      }); // showLoadingBar
      ctrl.positionList = res;
  }).catch(function (data, status) {
      toastr.error("Failed to retrieve users.");
      showLoadingBar({
          delay: .5,
          pct: 100,
          finish: function () {

          }
      }); // showLoadingBar
      console.log('Error in retrieving data')
  }).then(function () {
      $rootScope.unmaskLoading();
  });
}

  // Function to submit the form
  ctrl.submitForm = function () {
    
        
          if(ctrl.homeCarePlanForm.taskScheduleSet.length==0){
            return ctrl.isTasksSelected = true;
          }

    // Implement form submission logic here
    var medicalOrderFormToSave = angular.copy(ctrl.homeCarePlanForm);
    //   // signature
    //   medicalOrderFormToSave.signature = medicalOrderFormToSave.signature
    //   ? medicalOrderFormToSave.signature.substring(
    //       medicalOrderFormToSave.signature.indexOf(",") + 1
    //     )
    //   : null;

    // console.log("Home Care Plan Form Submitted", ctrl.homeCarePlanForm);
console.log("$('#home_care_plan_form')[0]",$('#home_care_plan_form')[0], ctrl.homeCarePlanFormName);

    if ($('#home_care_plan_form')[0].checkValidity()) {
console.log("validate true");
    }

  };
 


  ctrl.resetForm = function(){   
    ctrl.avoidWatch = true;
    ctrl.isTasksSelected = false;
    ctrl.clearPatientProxySignature();
    ctrl.clearNurseSignature();
    ctrl.generateFormCall();
    // ctrl.selectedBenefits = [];
    // delete ctrl.benifitObj.packageName;
    // ctrl.benifitObj.benefitPackageLineSet = _.remove(ctrl.benifitObj.benefitPackageLineSet,function(benefitPackageLine){
    //     return typeof benefitPackageLine.id !== 'undefined';
    // });
    
    // _.each(ctrl.benifitObj.benefitPackageLineSet,function(benefitPackageLine){
    //     benefitPackageLine.isDeleted = true;
    // });
    $timeout(function () {
      $('#tasks').multiSelect('refresh');
      $('#goals').multiSelect('refresh');
  });

    console.log("ctrl.homeCarePlanForm",ctrl.homeCarePlanForm);
  }

    
  

ctrl.openTaskModal = function (editMode) {
  var modalInstance = $modal.open({
      templateUrl: appHelper.viewTemplatePath('patient', 'tasks_modal'),
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      controller: 'TasksModalCtrl as tasksModal',
      resolve: {
        selectedType: function () {
            return ctrl.newSelectedType;
        },
        taskScheduleSet: function () {
          // console.log("ctrl.homeCarePlanForm.taskScheduleSet",ctrl.homeCarePlanForm,ctrl.homeCarePlanForm.taskScheduleSet);
            return angular.copy(ctrl.homeCarePlanForm.taskScheduleSet);
        },
        editMode: function () {
            return editMode;
        }
      }
  });

  modalInstance.result.then(function (result) {
    if (result.reverse) {
        avoidWatch = true;
        if (!editMode){
          ctrl.selectedTasks.splice(ctrl.selectedTasks.indexOf(parseInt(ctrl.newSelectedType)), 1);
        }
        else{
          ctrl.selectedTasks.push(parseInt(ctrl.newSelectedType));
        }
    }
    if (result.taskScheduleSet) {
        ctrl.homeCarePlanForm.taskScheduleSet = angular.copy(result.taskScheduleSet); // Update task schedules
    }
});
}
  

          $scope.$watch(function () {
            return ctrl.selectedTasks;
        }, function (newValue, oldValue) {
            if (avoidWatch === false) {
                $timeout(function () {
                    $("#tasks").multiSelect('refresh');
                });

                if (newValue != null && (oldValue == null || newValue.length > oldValue.length)) {
                    if (oldValue == null) {
                        ctrl.newSelectedType = newValue;
                    } else {
                        ctrl.newSelectedType = arr_diff(newValue, oldValue);
                    }

                    // Open the task modal
                    // console.log("if", ctrl.newSelectedType);
                    ctrl.openTaskModal(false);
                } else if (oldValue !== null && newValue.length < oldValue.length) {
                    ctrl.newSelectedType = arr_diff(oldValue, newValue);
                    // console.log("else", ctrl.newSelectedType);

                    ctrl.openTaskModal(true);  // Pass 'true' to indicate edit mode
                }
            } else {
                avoidWatch = false;
                $timeout(function () {
                    $("#tasks").multiSelect('refresh');
                });
            }
        }, true);



    function setupWatch() {
        $scope.$watch(
          function () {
            return ctrl.homeCarePlanForm;
          },
          function (newValue, oldValue) {
            if (newValue != oldValue) {
              $rootScope.isFormDirty = true;
            }
          },
          true
        );
      }

      function clearPatientProxySignature() {
        ctrl.homeCarePlanForm.patientProxySignature = "";
      }
    function clearNurseSignature() {
        ctrl.homeCarePlanForm.nurseSignature="";
      }
      
     
  }

  angular
    .module("xenon.controllers")
    .controller("HomeCarePlanCtrl", [
      "$rootScope",
      "$formService",
      "$filter",
      "PositionDAO",
      "TasksDAO",
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
      "$modal",
      HomeCarePlanCtrl,
    ]);
})();
