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
    console.log("$state.params.id", $state.params.id);
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

    ctrl.positionTasksList = [];
    ctrl.positionTasksMap = [];
    ctrl.mapPositionTasksListCall = mapPositionTasksList;
    ctrl.setPositionTaskDataCall = setPositionTaskData;

    ctrl.resetVar = false;
    ctrl.avoidWatch = true;
    ctrl.selectedTasks = [];
    ctrl.tasksErrorMsg = null;
    ctrl.isTasksSelected = false;

    ctrl.isGoalsSelected = false;

    ctrl.homeCarePlanForm = {};
    ctrl.generateFormCall = generateForms;

    ctrl.clearPatientProxySignatureCall = clearPatientProxySignature;
    ctrl.clearNurseSignatureCall = clearNurseSignature;

    /*================   FUNCTION CALLS   ===================*/
    $rootScope.maskLoading(); // Start loading

    Promise.all([ctrl.retrievePositions(), ctrl.retrieveTasks()])
      .then(function () {
        // Both ctrl.retrievePositions() and ctrl.retrieveTasks() are successful here
        return ctrl.mapPositionTasksListCall();
      })
      .then(ctrl.generateFormCall)
      .catch(function (error) {
        // Handle errors
        console.error("Error:", error);
      })
      .finally(function () {
        $rootScope.unmaskLoading(); // Stop loading in both success and error cases
      });

    /*================   FORM FUNCTIONS   ===================*/

    // Chaining the promises for function calls
    // All Position lists retrieve
    function retrievePositionsData() {
      return PositionDAO.view({ subAction: "all" })
        .then(function (res) {
          ctrl.positionList = res;
          delete ctrl.positionList["$promise"];
          delete ctrl.positionList["$resolved"];
        })
        .catch(function (data, status) {
          toastr.error("Failed to retrieve users.");
          console.log("Error in retrieving data");
          throw data; // Re-throw the error to propagate it to the Promise.all catch block
        });
    }

    // All task lists retrieve
    function retrieveTasksData() {
      return TasksDAO.view({ subAction: "all" })
        .then(function (res) {
          ctrl.taskList = res;
          delete ctrl.taskList["$promise"];
          delete ctrl.taskList["$resolved"];
        })
        .catch(function (data, status) {
          toastr.error("Failed to retrieve tasks.");
          throw data; // Re-throw the error to propagate it to the Promise.all catch block
        })
        .finally(function () {
          $timeout(function () {
            $("#tasks").multiSelect("refresh");
          });
        });
    }

    // mapping task according to position
    function mapPositionTasksList() {
      ctrl.positionTasksMap = [];
      ctrl.positionList.forEach(function (position) {
        position.items = [];
        ctrl.positionTasksMap[position.id] = [];

        ctrl.taskList.forEach(function (item) {
          if (
            item.companyPositionsString &&
            item.companyPositionsString.includes(position.position)
          ) {
            position.items.push(item);
            ctrl.positionTasksMap[position.id].push(item);
          }
        });
      });

      console.log(
        "see ctrl.positionList.items",
        ctrl.positionList,
        ctrl.positionTasksMap
      );
    }

    // Position task lists retrieve
    function setPositionTaskData(positionIdVal) {
      console.error(ctrl.positionTasksList);
      console.log(
        "position click",
        positionIdVal,
        ctrl.positionTasksMap,
        ctrl.positionTasksMap[positionIdVal]
      );

      ctrl.homeCarePlanForm.taskScheduleSet = [];
      if (ctrl.selectedTasks.length !== 0) {
        ctrl.avoidWatch = true;
        ctrl.selectedTasks = [];
      }
      ctrl.positionTasksList = [];

      ctrl.positionTasksList = ctrl.positionTasksMap[positionIdVal];

      // Refresh the multiSelect dropdown
      $timeout(function () {
        $("#tasks").multiSelect("refresh");
      });
    }

    // Form initialization
    ctrl.dataInit = function () {
      // $formService.resetRadios()
    };

    // ...

    // Reset dirty status of form
    function resetFormDirtyStatus() {
      if ($.fn.dirtyForms) {
        $("form").dirtyForms("setClean");
        $(".dirty").removeClass("dirty");
      }
    }

    // Form initialization
    function initializeFormData() {
      console.info("initializeFormData");
      ctrl.positionTasksList = [];
      ctrl.homeCarePlanForm = {
        positionId: "",
        taskScheduleSet: [],
        goals: "",
        canBeLeftAlone: "true",
        phoneNumber: "",
        name: "",
        patientProxySignature: null,
        nurseSignature: null,
      };
    }

    // Clear patient proxy signature
    function clearPatientProxySignature() {
      ctrl.homeCarePlanForm.patientProxySignature = null;
    }

    // Clear nurse signature
    function clearNurseSignature() {
      ctrl.homeCarePlanForm.nurseSignature = null;
    }

    // Form generation
    function generateForms() {
      $rootScope.isFormDirty = false;
      console.log(
        "generateForms nurseSignature",
        ctrl.homeCarePlanForm.nurseSignature,
        ctrl.params?.id
      );

      if (ctrl.params?.id) {
        console.info("if id -----------", ctrl.params.id);
        $rootScope.maskLoading();
        PatientDAO.get({ id: $state.params.id })
          .then(function (res) {
            console.log(
              "res,  ctrl.homeCarePlanForm",
              res,
              ctrl.homeCarePlanForm
            );
            // ctrl.avoidWatch = false;
            ctrl.patient = res;
            ctrl.patientName = res.fName;
            var gole = ['Hospitalization Reduction', 'Rehabilitation', 'Social & Recreational Activities Met'];
            var taskSchedule= [
              {
                  "selectedDays": ["Tu"],
                  "frequency": "dfg",
                  "additionalInstructions": "dfgsd",
                  "taskType": '58',
                  "isDeleted": false
              },
              {
                  "selectedDays": ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
                  "frequency": "sdf",
                  "additionalInstructions": "r4353543t",
                  "taskType": '61',
                  "isDeleted": false
              }
          ]
            // Initialize form data
            ctrl.homeCarePlanForm = {
              positionId: res?.positionId || '',
              taskScheduleSet: res?.taskScheduleSet || [], // Added array to store task schedules
              goals: res?.goals ? res.goals : [],
              canBeLeftAlone: res?.canBeLeftAlone || "true",
              phoneNumber: res?.phone,
              name: res?.secondaryContactName,
              patientProxySignature: res?.patientProxySignature || null,
              nurseSignature: res?.nurseSignature || null,
            };

            ctrl.homeCarePlanForm.positionId = 15;
            ctrl.setPositionTaskDataCall(ctrl.homeCarePlanForm.positionId);

            ctrl.homeCarePlanForm.taskScheduleSet = taskSchedule; // Added array to store task schedules
            // ctrl.selectedTasks; //assign the selected task according to taskScheduleSet
             if (ctrl.homeCarePlanForm.taskScheduleSet == null) {
                        ctrl.homeCarePlanForm.taskScheduleSet = [];
                    } else {
                        angular.forEach(ctrl.homeCarePlanForm.taskScheduleSet, function (obj) {
                            if (ctrl.positionTasksList.indexOf(obj.taskType)) {
                                ctrl.avoidWatch = true;
                                ctrl.selectedTasks.push(parseInt(obj.taskType));
                            }
                        });
                    }

            ctrl.homeCarePlanForm.goals = gole;
            console.log("ctrl.homeCarePlanForm.goals, ctrl.homeCarePlanForm.taskScheduleSet", ctrl.homeCarePlanForm.goals, ctrl.homeCarePlanForm.taskScheduleSet);
            console.warn(
              ctrl.homeCarePlanForm.positionId,
              ctrl.positionTasksList
            );
            $timeout(function () {
              $("#tasks").multiSelect("refresh");
              $("#goals").multiSelect("refresh");
            });
            

            console.log("ctrl.homeCarePlanForm", ctrl.homeCarePlanForm);

            
          })
          .catch(function (data, status) {
            showLoadingBar({
              delay: 0.5,
              pct: 100,
              finish: function () {},
            });
            toastr.error("Failed to retrieve patient");
            $window.history.back();
          })
          .then(function () {
            // setTimeout(function () {
            //     //Reset dirty status of form
                  //resetFormDirtyStatus()
            // }, 100);
            $rootScope.unmaskLoading();
          });
      } else {
        // Initialize form data when not in edit mode
        initializeFormData();
      }
      console.log(
        "form else 1 ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks",
        ctrl.resetVar,
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
      setupWatch();
      console.log(
        "form else 2 ctrl.resetVar, ctrl.avoidWatch , ctrl.selectedTasks",
        ctrl.resetVar,
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
      if (ctrl.resetVar === true) {
        if (ctrl.selectedTasks.length != 0) {
          ctrl.avoidWatch = true;
          ctrl.selectedTasks = [];
        }
      }

      console.log(
        "form else nurseSignature",
        ctrl.homeCarePlanForm.nurseSignature
      );
    }

    // Function to submit the form
    ctrl.submitForm = function () {
      console.log("Is the form dirty?", $scope.home_care_plan_form.$dirty);
      console.log("Is the form invalid?", $scope.home_care_plan_form.$invalid);
      console.log("Is the form valid?", $scope.home_care_plan_form.$valid);
      console.log("Form name:", $scope.home_care_plan_form.$name);

      console.log(
        "00 $('#home_care_plan_form')[0]",
        $("#home_care_plan_form")[0]
      );
      // Validate custom checks
      var validationCheck = ctrl.isValidCustomCheck();
      console.log("return", validationCheck);
      console.log("submit ctrl.homeCarePlanForm", ctrl.homeCarePlanForm);

      // Implement form submission logic here
      var medicalOrderFormToSave = angular.copy(ctrl.homeCarePlanForm);
      //   // signature
      //   medicalOrderFormToSave.signature = medicalOrderFormToSave.signature
      //   ? medicalOrderFormToSave.signature.substring(
      //       medicalOrderFormToSave.signature.indexOf(",") + 1
      //     )
      //   : null;

      if (
        $("#home_care_plan_form")[0].checkValidity() &&
        ctrl.isValidCustomCheck() === true
      ) {
        console.log("validate true", ctrl.homeCarePlanForm);
        // $scope.resetForm = true;
      } else {
        $scope.resetForm = false;
        // $rootScope.isFormDirty = true;
        ctrl.resetVar = false;
      }
    };

    ctrl.isValidCustomCheck = function () {
      var validCheckAll = true;
      if (ctrl.homeCarePlanForm?.taskScheduleSet?.length === 0) {
        // $scope.resetForm = false;
        ctrl.isTasksSelected = true;
        validCheckAll = false;
      }
      if (ctrl.homeCarePlanForm?.goals?.length === 0) {
        // $scope.resetForm = false;
        ctrl.isGoalsSelected = true;
        validCheckAll = false;
      }

      return validCheckAll;
    };

    ctrl.resetForm = function () {
      initializeFormData();
      console.log("reset nurseSignature", ctrl.homeCarePlanForm.nurseSignature);

      ctrl.resetVar = true;
      console.log(
        " resetForm ctrl.avoidWatch",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
      // if (ctrl.selectedTasks.length === 0) {
      //   ctrl.avoidWatch = false;
      // } else {
      //   ctrl.avoidWatch = true;
      // ctrl.selectedTasks = [];
      // }

      ctrl.isTasksSelected = false;
      console.log(
        " resetForm ctrl.avoidWatch 1",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );

      ctrl.isGoalsSelected = false;
      // ctrl.clearPatientProxySignature();
      // ctrl.clearNurseSignature();

      $timeout(function () {
        $("#tasks").multiSelect("refresh");
        $("#goals").multiSelect("refresh");
      });
      console.log(
        " resetForm ctrl.avoidWatch 2 ",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );

      // ctrl.selectedTasks = [];
      console.log(
        " resetForm ctrl.avoidWatch 3",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
      $scope.resetForm = true;
      ctrl.generateFormCall();
      console.log(
        " resetForm ctrl.avoidWatch 4",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );

      console.log("$('#home_care_plan_form')[0]", $("#home_care_plan_form")[0]);
      // console.log("reset form ctrl.homeCarePlanForm",ctrl.homeCarePlanForm);
      //after reset
      console.log(
        " resetForm ctrl.avoidWatch 5 ",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
      ctrl.resetVar = false;
      console.log(
        " resetForm ctrl.avoidWatch 6",
        ctrl.avoidWatch,
        ctrl.selectedTasks
      );
    };

    ctrl.openTaskModal = function (editMode) {
      console.log("open  model", ctrl.avoidWatch, ctrl.selectedTasks);
      var modalInstance = $modal.open({
        templateUrl: appHelper.viewTemplatePath("patient", "tasks_modal"),
        size: "md",
        backdrop: "static",
        keyboard: false,
        controller: "TasksModalCtrl as tasksModal",
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
          },
        },
      });

      modalInstance.result.then(function (result) {
        if (result.reverse) {
          console.log("modalInstance.result", ctrl.avoidWatch, result);
          ctrl.avoidWatch = true;
          console.log("modalInstance.result 1", ctrl.avoidWatch);
          if (!editMode) {
            ctrl.selectedTasks.splice(
              ctrl.selectedTasks.indexOf(parseInt(ctrl.newSelectedType)),
              1
            );
          } else {
            ctrl.selectedTasks.push(parseInt(ctrl.newSelectedType));
          }
        }
        if (result.taskScheduleSet) {
          ctrl.homeCarePlanForm.taskScheduleSet = angular.copy(
            result.taskScheduleSet
          ); // Update task schedules
        }
      });
    };

    $scope.$watch(
      function () {
        return ctrl.selectedTasks;
      },
      function (newValue, oldValue) {
        if (ctrl.avoidWatch === false) {
          console.log(" watch newValue", ctrl.avoidWatch, ctrl.selectedTasks, newValue);

          $timeout(function () {
            $("#tasks").multiSelect("refresh");
          });

          if (
            newValue != null &&
            (oldValue == null || newValue.length > oldValue.length)
          ) {
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

            ctrl.openTaskModal(true); // Pass 'true' to indicate edit mode
          }
        } else {
          ctrl.avoidWatch = false;
          console.log(" watch else 1", ctrl.avoidWatch, ctrl.selectedTasks);
          $timeout(function () {
            $("#tasks").multiSelect("refresh");
          });
        }
      },
      true
    );

    function setupWatch() {
      console.log("setupWatch call");
      $scope.$watch(
        function () {
          return ctrl.homeCarePlanForm;
        },
        function (newValue, oldValue) {
          if (newValue != oldValue) {
            // console.log("watch nurseSignature", ctrl.homeCarePlanForm.nurseSignature);
            // console.log("watch patientProxySignature", ctrl.homeCarePlanForm.patientProxySignature);
            console.log(
              "again watch",
              ctrl.avoidWatch,
              ctrl.selectedTasks,
              oldValue,
              newValue
            );
            $rootScope.isFormDirty = true;
          }
        },
        true
      );
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
