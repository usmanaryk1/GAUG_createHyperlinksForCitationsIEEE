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
    ctrl.resetVar = false;
    ctrl.avoidWatch = true;
    ctrl.selectedTasks = [];
    ctrl.tasksErrorMsg = null;
    ctrl.isTasksSelected= false;

    ctrl.isGoalsSelected= false;

    
    ctrl.homeCarePlanForm = {}
    ctrl.generateFormCall = generateForms;
    
    ctrl.clearPatientProxySignatureCall = clearPatientProxySignature;
    ctrl.clearNurseSignatureCall = clearNurseSignature;

    /*================   FUNCTION CALLS   ===================*/
    ctrl.retrievePositions();
    ctrl.retrieveTasks();
    ctrl.generateFormCall();

    /*================   FORM FUNCTIONS   ===================*/
    function generateForms() {
      $rootScope.isFormDirty = false;
      console.log("generateForms nurseSignature", ctrl.homeCarePlanForm.nurseSignature, ctrl.params?.id);

      if (ctrl.params?.id) {
        console.info("id -----------",ctrl.params.id);
        $rootScope.maskLoading();
        PatientDAO.get({ id: $state.params.id }).then(function (res) {
          // ctrl.avoidWatch = false;
          ctrl.patient = res;
          ctrl.patientName = res.fName;
          // Initialize form data
          ctrl.homeCarePlanForm = {
            position: res.position,
            taskScheduleSet: res.taskScheduleSet, // Added array to store task schedules
            goals: res.goals,
            canBeLeftAlone: res.canBeLeftAlone,
            emergencyContact: {
              phoneNumber: res.emergencyContact.phoneNumber,
              name: res.emergencyContact.name,
            },
            patientProxySignature: res.patientProxySignature,
            nurseSignature: res.nurseSignature,
          };

          // ctrl.selectedTasks; //assign the selected task according to taskScheduleSet

        //   $timeout(function () {
        //     if (ctrl.user.employee.id != null) {
        //         $("#sboxit-2").select2("val", ctrl.user.employee.id);
        //     }
        // }, 500);

          $rootScope.unmaskLoading();
        }).catch(function (data, status) {
          toastr.error("Failed to retrieve user.");
          // ctrl.retrivalRunning = false;
          // console.log(JSON.stringify(ctrl.user.employee))
      }).then(function () {
          // setTimeout(function () {
          //     //Reset dirty status of form
          //     if ($.fn.dirtyForms) {
          //         $('form').dirtyForms('setClean');
          //         $('.dirty').removeClass('dirty');
          //     }
          // }, 100);
      });
      } else {
          // Initialize form data
          console.log("form else ctrl.avoidWatch , ctrl.selectedTasks ", ctrl.avoidWatch , ctrl.selectedTasks);
          
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
        }
        console.log("form else 1 ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks", ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks);
        setupWatch();
        console.log("form else 2 ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks", ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks);
        if( ctrl.resetVar === true ){
          if (ctrl.selectedTasks.length != 0 ) {    
            ctrl.avoidWatch= true;
              ctrl.selectedTasks = [];
          }
        }

        console.log("form else nurseSignature", ctrl.homeCarePlanForm.nurseSignature);

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

    console.log("Is the form dirty?", $scope.home_care_plan_form.$dirty);
console.log("Is the form invalid?", $scope.home_care_plan_form.$invalid);
console.log("Is the form valid?", $scope.home_care_plan_form.$valid);
console.log("Form name:", $scope.home_care_plan_form.$name);
    
    console.log("00 $('#home_care_plan_form')[0]",$('#home_care_plan_form')[0], );
    // Validate custom checks
    var validationCheck = ctrl.isValidCustomCheck();
    console.log("return",validationCheck );
console.log("submit ctrl.homeCarePlanForm", ctrl.homeCarePlanForm);
        

    // Implement form submission logic here
    var medicalOrderFormToSave = angular.copy(ctrl.homeCarePlanForm);
    //   // signature
    //   medicalOrderFormToSave.signature = medicalOrderFormToSave.signature
    //   ? medicalOrderFormToSave.signature.substring(
    //       medicalOrderFormToSave.signature.indexOf(",") + 1
    //     )
    //   : null;

    if ($('#home_care_plan_form')[0].checkValidity() && ctrl.isValidCustomCheck() === true ) {
console.log("validate true", ctrl.homeCarePlanForm);
            // $scope.resetForm = true;

    }else{
      $scope.resetForm = false;
      ctrl.resetVar = false;
    }

  };

  ctrl.isValidCustomCheck= function () {
    var validCheckAll= true;
    if(ctrl.homeCarePlanForm.taskScheduleSet.length==0){
      // $scope.resetForm = false;
      ctrl.isTasksSelected = true;
      validCheckAll = false;
    }
    if(ctrl.homeCarePlanForm.goals.length==0){
      // $scope.resetForm = false;
      ctrl.isGoalsSelected = true;
      validCheckAll = false;
    }

    return validCheckAll;
  }
 


  ctrl.resetForm = function(){ 
    console.log("reset nurseSignature", ctrl.homeCarePlanForm.nurseSignature);

    ctrl.resetVar = true; 
    console.log(" resetForm ctrl.avoidWatch",ctrl.avoidWatch , ctrl.selectedTasks );
    // if (ctrl.selectedTasks.length === 0) {
    //   ctrl.avoidWatch = false;
    // } else {
    //   ctrl.avoidWatch = true;
      // ctrl.selectedTasks = [];
    // }
    
    ctrl.isTasksSelected = false;
    console.log(" resetForm ctrl.avoidWatch 1",ctrl.avoidWatch , ctrl.selectedTasks );
    
    ctrl.isGoalsSelected = false;
    // ctrl.clearPatientProxySignature();
    // ctrl.clearNurseSignature();
    
    $timeout(function () {
      $('#tasks').multiSelect('refresh');
      $('#goals').multiSelect('refresh');
    });
    console.log(" resetForm ctrl.avoidWatch 2 ",ctrl.avoidWatch , ctrl.selectedTasks );
    
    // ctrl.selectedTasks = [];
    console.log(" resetForm ctrl.avoidWatch 3",ctrl.avoidWatch , ctrl.selectedTasks );
    $scope.resetForm = true;
    ctrl.generateFormCall();
    console.log(" resetForm ctrl.avoidWatch 4",ctrl.avoidWatch , ctrl.selectedTasks );

    console.log("$('#home_care_plan_form')[0]",$('#home_care_plan_form')[0], );
    // console.log("reset form ctrl.homeCarePlanForm",ctrl.homeCarePlanForm);
    //after reset 
    console.log(" resetForm ctrl.avoidWatch 5 ",ctrl.avoidWatch , ctrl.selectedTasks );
    ctrl.resetVar = false; 
    console.log(" resetForm ctrl.avoidWatch 6",ctrl.avoidWatch , ctrl.selectedTasks );

  }

    
  

ctrl.openTaskModal = function (editMode) {
  console.log("open  model", ctrl.avoidWatch , ctrl.selectedTasks);
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
      console.log("modalInstance.result",ctrl.avoidWatch, result);
      ctrl.avoidWatch = true;
      console.log("modalInstance.result 1",ctrl.avoidWatch);
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
            if (ctrl.avoidWatch === false) {
              console.log(" watch ",ctrl.avoidWatch , ctrl.selectedTasks );

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
                ctrl.avoidWatch = false;
                console.log(" watch else 1",ctrl.avoidWatch , ctrl.selectedTasks );
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
              console.log("watch nurseSignature", ctrl.homeCarePlanForm.nurseSignature);
              console.log("watch patientProxySignature", ctrl.homeCarePlanForm.patientProxySignature);
              console.log("again watch", ctrl.avoidWatch , ctrl.selectedTasks, newValue, oldValue);
              $rootScope.isFormDirty = true;
            }
          },
          true
        );
      }

      function clearPatientProxySignature() {
        ctrl.homeCarePlanForm.patientProxySignature = null;
      }
    function clearNurseSignature() {
        ctrl.homeCarePlanForm.nurseSignature= null;
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
