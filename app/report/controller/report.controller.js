(function () {
    function ReportCtrl(Page, $rootScope, EmployeeDAO, PatientDAO) {
        var ctrl = this;
        ctrl.companyCode = ontimetest.company_code;
        ctrl.baseUrl = ontimetest.weburl;
        ctrl.reportTypeList = ontimetest.reportTypes;
        ctrl.reportSubTypeList = ontimetest.reportSubTypes;
        ctrl.searchParams = {};
        ctrl.maxDate = angular.copy($rootScope.todayDate);
        Page.setTitle("Report");

        ctrl.downloadReport = function (format) {
            if ($('#report_form')[0].checkValidity() && ctrl.reportType) {
                var valid = true;
                if (ctrl.reportType == 'workedhours' || ctrl.reportType == 'employeetimesheet' || ctrl.reportType == 'patienttimesheet') {
                    ctrl.verifyDates();
                    if (ctrl.dateMessage != null) {
                        valid = false;
                        toastr.error(ctrl.dateMessage);
                    }
                }
                if (valid) {
                    $rootScope.maskLoading();
                    var path = $rootScope.serverPath + 'reports/' + ctrl.reportType + '/download?format=' + format + "&companyCode=" + ontimetest.company_code;
                    if (ctrl.searchParams.fromDate && ctrl.searchParams.toDate) {
                        path = path + "&fromDate=" + ctrl.searchParams.fromDate + "&toDate=" + ctrl.searchParams.toDate;
                    }
                    if (ctrl.searchParams.type || ctrl.reportType == 'employeetimesheet' || ctrl.reportType == 'patienttimesheet') {
                        path = path + "&type=" + ctrl.searchParams.type + "&id=" + ctrl.searchParams.id;
                    }
                    window.location.href = path;
                    $rootScope.unmaskLoading();
                }
            }
        };
        ctrl.setMaxDate = function () {
            if (ctrl.searchParams.toDate) {
                ctrl.maxDate = angular.copy(ctrl.searchParams.toDate);
            } else {
                ctrl.maxDate = angular.copy($rootScope.todayDate);
            }
        };
        ctrl.typeChange = function () {
            ctrl.searchParams = {};
        };
        ctrl.resetFilters = function () {
            delete ctrl.reportType;
            ctrl.searchParams = {};
        };
        ctrl.verifyDates = function () {
            if (new Date(ctrl.searchParams.fromDate).getDay() != 0 || new Date(ctrl.searchParams.toDate).getDay() != 6) {
                ctrl.dateMessage = "From date must be Sunday & To date must be Saturday.";
            } else {
                var a = moment(new Date(ctrl.searchParams.fromDate));
                var b = moment(new Date(ctrl.searchParams.toDate));
                var diff = b.diff(a, 'days');
                if (diff > 6) {
                    ctrl.dateMessage = "Date range should be no more of 7 days.";
                } else {
                    ctrl.dateMessage = null;
                }
            }
        };
        ctrl.retrieveAllEmployees = function () {
            EmployeeDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
                ctrl.employeeList = res;
            });
        };
        ctrl.retrieveAllPatients = function () {
            PatientDAO.retrieveAll({subAction: 'active', sortBy: 'lName', order: 'asc'}).then(function (res) {
                ctrl.patientList = res;
            });
        };
        ctrl.retrieveAllEmployees();
        ctrl.retrieveAllPatients();
    }
    angular.module('xenon.controllers').controller('ReportCtrl', ["Page", "$rootScope", "EmployeeDAO", "PatientDAO", ReportCtrl]);
})();
