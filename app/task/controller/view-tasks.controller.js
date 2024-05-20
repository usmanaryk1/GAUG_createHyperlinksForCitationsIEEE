(function () {
    function ViewTasksCtrl(TasksDAO, $rootScope, $stateParams, $state, $modal, Page, $debounce, $timeout, $formService, PositionDAO, LanguageDAO) {
        var ctrl = this;
        
        function initialize(){
            $rootScope.maskLoading();
            Page.setTitle("Tasks");
            ctrl.companyCode = ontime_data.company_code;
            ctrl.baseUrl = ontime_data.weburl;

            ctrl.taskList = [];
            
            ctrl.retrieveTasks = retrieveTasksData;
            ctrl.addEditPopup = addEditPopup;
            ctrl.getPositions = getPositions;
            ctrl.getLanguages = getLanguages;
            //ctrl.save = save;
            ctrl.activateDeactivatePopup = activateDeactivatePopup;
            ctrl.activateDeactivateTask = activateDeactivateTask;
            //ctrl.changeStatus = changeStatus;
            ctrl.retrieveTasks();
        }

        function initMultiSelect(){
            setTimeout(function () {
                $("#companyPositionId").multiSelect({
                    afterInit: function()
                    {
                        // Add alternative scrollbar to list
                        this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar();
                    },
                    afterSelect: function()
                    {
                        // Update scrollbar size
                        this.$selectableContainer.add(this.$selectionContainer).find('.ms-list').perfectScrollbar('update');
                    }
                });
                $("#options").select2({
                    placeholder: 'Choose Options',
                    allowClear: true
                }).on('select2-open', function()
                {
                    // Adding Custom Scrollbar
                    $(this).data('select2').results.addClass('overflow-hidden').perfectScrollbar();
                });
            }, 100);
        }

        function getPositions() {
            PositionDAO.view({subAction: 'active'}).then(function (res) {
                $rootScope.taskModel.positions = res;
            });
        };

        function getLanguages(){
            LanguageDAO.view({subAction: 'active'}).then(function (res) {
                $rootScope.taskModel.languages = res;
            });
        }

        function retrieveTasksData(){

            TasksDAO.view({subAction: 'all'}).then(function (res) {
                showLoadingBar({
                    delay: .5,
                    pct: 100,
                    finish: function () {
                    }
                }); // showLoadingBar
                ctrl.taskList = res;
                console.log("retrieve task");
                console.log(ctrl.taskList);
            }).catch(function (data, status) {
                toastr.error("Failed to retrieve tasks.");
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

        function addEditPopup(task) {
            var taskCopy = angular.copy(task);
            $rootScope.taskModel = $modal.open({
                templateUrl: 'taskModel'
            });

            if(taskCopy == undefined) { 
                $rootScope.taskModel.title = 'Add New Task';
                $rootScope.taskModel.position = {};
                $rootScope.taskModel.position.action = 'savetask';
            }else{
                $rootScope.taskModel.title = 'Edit Task';
                $rootScope.taskModel.position = taskCopy;
                $rootScope.taskModel.position.action = 'updatetask';
            }

            ctrl.getPositions();
            ctrl.getLanguages();
            
            $rootScope.taskModel.closePopup = function(){
                $rootScope.taskModel.close();
            }

            $rootScope.taskModel.save = function(){
                if($rootScope.taskModel.task_form.$valid){
                   // ctrl.save($rootScope.taskModel.task);   
                }                
            }
            initMultiSelect();
        }

        // function save(position){
        //     //position.positionGroup = position.positionGroup.join(',');
        //     PositionDAO.update(position).then(function (res) {
        //         showLoadingBar({
        //             delay: .5,
        //             pct: 100,
        //             finish: function () {
        //             }
        //         }); // showLoadingBar
        //         toastr.success("Company Position saved.");
        //         $rootScope.positionModel.close(); 
        //         ctrl.retrievePositions();
        //         //Reset dirty status of form
        //         if ($.fn.dirtyForms) {
        //             $('form').dirtyForms('setClean');
        //             $('.dirty').removeClass('dirty');
        //         }
        //     }).catch(function (data, status) {
        //         toastr.error(data.data);
        //         showLoadingBar({
        //             delay: .5,
        //             pct: 100,
        //             finish: function () {

        //             }
        //         }); // showLoadingBar
        //         console.log('Error in retrieving data')
        //     }).then(function () {
        //         $rootScope.unmaskLoading();
        //     });
        // }

        function activateDeactivatePopup(task, modal_id, action, modal_size, modal_backdrop)
        {
            $rootScope.taskActivateModal = $modal.open({
                templateUrl: modal_id,
                size: modal_size,
                backdrop: typeof modal_backdrop == 'undefined' ? true : modal_backdrop,
                keyboard: false
            });
            
            $rootScope.taskActivateModal.action = action;
            $rootScope.taskActivateModal.task = task;

            if(action == 'activate'){
                $rootScope.taskActivateModal.title = 'Activate Task';
            }else{
                $rootScope.taskActivateModal.title = 'Deactivate Task';
            }
            
            
            $rootScope.taskActivateModal.confirm = function (task) {
                ctrl.activateDeactivateTask(task, action);
            };

            $rootScope.taskActivateModal.dismiss = function(){
                $rootScope.taskActivateModal.close();
            }

        }

        function activateDeactivateTask(task, action){
            TasksDAO.changestatus({id: task.id, status: action}).then(function (res) {
                toastr.success("Task " + action + "d.");
                ctrl.retrieveTasks();
            }).catch(function (data, status) {
                toastr.error("Task cannot be " +  action  + "d.");
            }).then(function () {
                $rootScope.taskActivateModal.close();
                $rootScope.unmaskLoading();
            });
        }

        initialize();
    };

    angular.module('xenon.controllers').controller('ViewTasksCtrl', ["TasksDAO", "$rootScope", "$stateParams", "$state", "$modal", "Page", "$debounce", "$timeout", "$formService", "PositionDAO", "LanguageDAO", ViewTasksCtrl]);
})();