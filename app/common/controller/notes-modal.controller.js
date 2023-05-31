(function () {
    function EmployeeNotesCtrl(employeeId, $rootScope, $modal, $modalInstance, EmployeeDAO) {
        var ctrl = this;

        $rootScope.maskLoading();

        ctrl.employeeId = employeeId;

        ctrl.close = function () {
            $modalInstance.close();
        };
    }
    ;
    angular.module('xenon.controllers').controller('EmployeeNotesCtrl', ["employeeId", "$rootScope", "$modal", "$modalInstance", "EmployeeDAO", EmployeeNotesCtrl]);
})();

angular.module('xenon.directives').directive('notesDirective', function ($compile, $rootScope, EmployeeDAO) {
    return {
        restrict: 'E',
        scope: {
            defaultTemplate: "=?",
            employeeId: "=?",
            hasCreate: "=?",
            hasRetrieve: "=?",
            canDelete: "=?",
            canEdit: "=?"
        },
        link: function (scope) {
            scope.data = {note: ""};
            scope.rerenderDataTable = function () {
                EmployeeDAO.getNotes({employeeId: scope.employeeId}).then(function (res) {
                    scope.notes = angular.copy(res);
                    $rootScope.unmaskLoading();
                });
            };

            scope.addNote = function () {
                if ($('#EmployeeNotesData')[0].checkValidity()) {
                    $rootScope.maskLoading();
                    EmployeeDAO.addNotes(
                            {employeeId: scope.employeeId,
                                note: {note: scope.data.note}}).then(function (res) {
                        if (scope.hasRetrieve)
                            scope.rerenderDataTable();
                        delete scope.data.note;
                        toastr.success("Note added.");
                    }
                    ).catch(function (data, status) {
                        toastr.error("Note cannot be added.");
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }
            };

            scope.saveNote = function () {
                if ($('#EmployeeNotesData')[0].checkValidity()) {
                    $rootScope.maskLoading();
                    EmployeeDAO.updateNotes(
                            {employeeId: scope.employeeId,
                                noteId:scope.data.id,
                                note: {note: scope.data.note}}).then(function (res) {
                        if (scope.hasRetrieve)
                            scope.rerenderDataTable();
                        scope.data = {note: ""};
                        toastr.success("Note updated successfully.");
                    }
                    ).catch(function (data, status) {
                        toastr.error("Note cannot be updated.");
                    }).then(function () {
                        $rootScope.unmaskLoading();
                    });
                }
            };

            scope.deleteNote = function (noteId) {
                $rootScope.maskLoading();
                EmployeeDAO.deleteNotes(
                        {employeeId: scope.employeeId,
                                noteId:noteId}).then(function (res) {
                    if (scope.hasRetrieve)
                        scope.rerenderDataTable();
                    toastr.success("Note deleted successfully.");
                }
                ).catch(function (data, status) {
                    toastr.error("Note cannot be deleted.");
                }).then(function () {
                    $rootScope.unmaskLoading();
                });
            };

            scope.editNote = function (note) {
                scope.data = angular.copy(note);
            };

            if (scope.hasCreate && scope.hasRetrieve) {
                scope.rerenderDataTable();
            } else {
                $rootScope.unmaskLoading();
            }
        },
        templateUrl: function (elem, attrs) {
            return appHelper.viewTemplatePath('common', 'notes-directive');
        }
    };
});