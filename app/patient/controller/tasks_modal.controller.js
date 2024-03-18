(function () {
    function TasksModalCtrl(selectedType, taskScheduleSet, editMode, $modalInstance, $timeout) {
        var ctrl = this;
        ctrl.editMode = editMode;
        
        // console.log("selectedType, taskScheduleSet, editMode",selectedType, taskScheduleSet, editMode,);
        // Define the days of the week
        ctrl.daysOfWeek = ['Su', 'Mo',];

        
        ctrl.generateFormCall = generateForms;

        /*================   FUNCTION CALLS   ===================*/
    ctrl.generateFormCall();

    /*================   FORM FUNCTIONS   ===================*/
    function generateForms() {
          // Initialize form data
          ctrl.daysErrorMsg = null;
          ctrl.parameters = {
            selectedDays: [],
            frequency: "", 
            additionalInstructions: "" 
        };  
        if (selectedType !== null) {
            ctrl.selectedTasksObj = selectedType[0];
        }
        if (_.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj})) {
            ctrl.parameters = angular.copy(_.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj}));
        } else {
            ctrl.parameters.taskType = selectedType[0];
        }

        }
        // console.log("ctrl.selectedTasksObj , selectedType[0]",ctrl.selectedTasksObj ,selectedType[0]);

        // Toggle the selection of a day
        ctrl.toggleDay = function (day) {
            var index = ctrl.parameters.selectedDays.indexOf(day);
            if (index === -1) {
                ctrl.parameters.selectedDays.push(day);
            } else {
                ctrl.parameters.selectedDays.splice(index, 1);
            }
        };

       // Select all days at once or deselect if all are already selected
        ctrl.selectAllDays = function () {
            if (ctrl.parameters.selectedDays.length === ctrl.daysOfWeek.length) {
                // If all days are selected, clear the array
                ctrl.parameters.selectedDays = [];
            } else {
                // Otherwise, select all days
                ctrl.parameters.selectedDays = angular.copy(ctrl.daysOfWeek);
            }
        };

        ctrl.save = function () {
             //Check validity for days
            if (ctrl.parameters.selectedDays.length === 0) {
                // console.log("validate days ");
                // Rest of your save logic
            return  ctrl.daysErrorMsg = "Please select at least one day."
            }

            console.log("save", taskScheduleSet, ctrl.selectedTasksObj, ctrl.parameters);


            if ($('#task_model_form')[0].checkValidity()) {
                console.log("validate", );
                ctrl.parameters.isDeleted = false;
                if (_.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj}) && _.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj}).isDeleted === false) {
                    $modalInstance.close({reverse: true, taskScheduleSet: _.map(taskScheduleSet, function (taskTypeObj) {
                            return ctrl.parameters.taskType === taskTypeObj.taskType ? ctrl.parameters : taskTypeObj;
                        })});
                } else if (_.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj}) && _.find(taskScheduleSet, {taskType: ctrl.selectedTasksObj}).isDeleted === true) {
                    $modalInstance.close({reverse: false, taskScheduleSet: _.map(taskScheduleSet, function (taskTypeObj) {
                            return ctrl.parameters.taskType === taskTypeObj.taskType ? ctrl.parameters : taskTypeObj;
                        })});
                } else {
                    taskScheduleSet.push(ctrl.parameters);
                    $modalInstance.close({reverse: false, taskScheduleSet: taskScheduleSet});
                }

            // Save the parameters task details
            // Add the parameters task details to selectedType
            // You can also perform validation before saving
            // ...
            }
        };

        ctrl.reset = function(){
            console.log("reet");
            ctrl.generateFormCall(); 
        }

         ctrl.remove = function () {
            ctrl.parameters.isDeleted = true;
            console.log("remove,  ctrl.parameters, taskScheduleSet",ctrl.parameters, taskScheduleSet);
            if (ctrl.parameters.id) { // for edit logic if there is position id then edit
                $modalInstance.close({reverse: false, taskScheduleSet: _.map(taskScheduleSet, function (taskTypeObj) {
                        return ctrl.parameters.taskType === taskTypeObj.taskType ? ctrl.parameters : taskTypeObj;
                    })});
            } else {
                $modalInstance.close({reverse: false, taskScheduleSet: _.remove(taskScheduleSet, function (taskTypeObj) {
                        return ctrl.parameters.taskType !== taskTypeObj.taskType;
                    })});
            }
        };

        ctrl.cancel = function () {
            // Reverse the action if canceled
            $modalInstance.close({ reverse: true });
        };

        //to make the radio buttons selected, theme bug
        setTimeout(function () {
            cbr_replace();
        }, 100);
    }
    angular.module('xenon.controllers').controller('TasksModalCtrl', ["selectedType", "taskScheduleSet", "editMode", "$modalInstance", "$timeout",TasksModalCtrl]);
})();
