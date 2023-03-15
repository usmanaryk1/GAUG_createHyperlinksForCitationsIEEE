(function () {
    function WorksiteInfoCtrl(worksiteId, $rootScope, $modal, $modalInstance, WorksiteDAO) {
        var ctrl = this;

        ctrl.companyCode = ontime_data.company_code;
        ctrl.baseUrl = ontime_data.weburl;
        $rootScope.maskLoading();

        WorksiteDAO.get({id: worksiteId}).then(function (res) {
            console.log("worksite",res);
            ctrl.worksite = angular.copy(res);
            $rootScope.unmaskLoading();
        });

        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('WorksiteInfoCtrl', ["worksiteId", "$rootScope", "$modal", "$modalInstance", "WorksiteDAO", WorksiteInfoCtrl]);
})();