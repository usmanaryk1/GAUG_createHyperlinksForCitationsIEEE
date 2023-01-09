(function () {
    function DashboardCtrl(Page, $rootScope, $modal, $timeout, UserDAO) {
        var ctrl = this;
        Page.setTitle("Dashboard");
        $rootScope.isAdminPortal = false;
        var tasks = JSON.parse(localStorage.getItem("tasks"));
        if (tasks != null && tasks[$rootScope.currentUser.userName] != null) {
            ctrl.taskList = tasks[$rootScope.currentUser.userName];
        } else {
            ctrl.taskList = [];
        }
        $timeout(function () {
            $("#taskList").perfectScrollbar().addClass('overflow-hidden');
        });
        ctrl.taskMarked = function (index) {
            ctrl.taskList.splice(index, 1);                        
            setTasksInLocalStorage();
        };
        ctrl.addTask = function () {
            
            if (ctrl.taskName != null && ctrl.taskName != '') {                
                ctrl.taskList.push(ctrl.taskName);                
                ctrl.taskName = null;
                setTasksInLocalStorage();
            }
        };
        var setTasksInLocalStorage = function () {
            $timeout(function(){
                $("#taskList").perfectScrollbar("update");
            });
            if (tasks == null) {
                tasks = {};
            }
            tasks[$rootScope.currentUser.userName] = ctrl.taskList;
            localStorage.setItem("tasks", JSON.stringify(tasks));
        };

    }
    ;
    angular.module('xenon.controllers').controller('DashboardCtrl', ["Page", "$rootScope", "$modal", "$timeout", "UserDAO", DashboardCtrl]);
})();
