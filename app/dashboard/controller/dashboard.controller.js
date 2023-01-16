(function () {
    function DashboardCtrl(Page, $rootScope, $formService, $timeout, UserDAO, DashboardDAO, $filter) {
        var ctrl = this;
        Page.setTitle("Dashboard");        
        ctrl.weatherObj = {location: ontime_data.weatherCity,currentTime:new Date().getTime()/1000};
//        $rootScope.isAdminPortal = false;
        var tasks = JSON.parse(localStorage.getItem("tasks"));
        ctrl.weatherIcons = {'clear-day': 'meteocons-sun', 'clear-night': 'meteocons-moon', 'rain': 'meteocons-rain', 'snow': 'meteocons-snow', 'sleet': 'meteocons-rain', 'wind': 'meteocons-wind', 'fog': 'meteocons-fog', 'cloudy': 'meteocons-cloud', 'partly-cloudy-day': 'meteocons-cloud-sun', 'partly-cloudy-night': 'meteocons-cloud-moon'}
        if (tasks != null && tasks[$rootScope.currentUser.userName] != null) {
            //this flag is used to hide the flickering from normal checkbox to theme checkbox
            ctrl.inProgress = true;
            ctrl.taskList = tasks[$rootScope.currentUser.userName];
            $timeout(function () {
                cbr_replace();
                ctrl.inProgress = false;
            });
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
                //this flag is used to hide the flickering from normal checkbox to theme checkbox
                ctrl.inProgress = true;
                ctrl.taskList.push(ctrl.taskName);
                $timeout(function () {
                    cbr_replace();
                    ctrl.inProgress = false;
                    ctrl.taskName = null;
                    setTasksInLocalStorage();
                });
            }
        };
        var setTasksInLocalStorage = function () {
            $timeout(function () {
                $("#taskList").perfectScrollbar("update");
            });
            if (tasks == null) {
                tasks = {};
            }
            tasks[$rootScope.currentUser.userName] = ctrl.taskList;
            localStorage.setItem("tasks", JSON.stringify(tasks));
        };
        ctrl.retrieveCounts = function () {
            DashboardDAO.getCompianceTrackerCount({currentDate: $filter('date')(new Date(), $rootScope.dateFormat)}).then(function (res) {
                ctrl.complianceTracker = res.count;
            });
            DashboardDAO.getActivePatientCount().then(function (res) {
                ctrl.activePatientCount = res.count;
            });
            DashboardDAO.getOpenCasesCount({currentDate: $filter('date')(new Date(), $rootScope.dateFormat)}).then(function (res) {
                ctrl.openCasesCount = res.count;
            });
            DashboardDAO.getDischargedPatientsCount({currentDate: $filter('date')(new Date(), $rootScope.dateFormat)}).then(function (res) {
                ctrl.dischargedPatientsCount = res.count;
            });
        };
        ctrl.retrieveWeather = function () {
            DashboardDAO.getWeather().then(function (res) {
                ctrl.weatherObj = res;
            });
        };
        ctrl.retrieveCounts();
        ctrl.retrieveWeather();

    }
    ;
    angular.module('xenon.controllers').controller('DashboardCtrl', ["Page", "$rootScope", "$formService", "$timeout", "UserDAO", "DashboardDAO", "$filter", DashboardCtrl]);
})();
