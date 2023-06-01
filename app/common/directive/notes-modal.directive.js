/* global _, appHelper */

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

            function initData() {
                scope.notes = [];
                scope.allLoaded = false;
                scope.data = {note: ""};
                scope.searchParams = {employeeId: scope.employeeId, pageNo: 1, limit: 10, action: scope.employeeId, subAction: 'notes'};
                if (scope.hasRetrieve) {
                    scope.rerenderDataTable();
                } else {
                    $rootScope.unmaskLoading();
                }
            }

            scope.rerenderDataTable = function () {
                EmployeeDAO.getNotes(scope.searchParams).then(function (res) {
                    if (res.length < scope.searchParams.limit)
                        scope.allLoaded = true;
                    scope.loading = false;
                    scope.notes = _.concat(scope.notes, angular.copy(res));
                    setTimeout(function () {
                        (function ($) {
                            $.fn.hasScrollBar = function () {
                                return this.get(0).scrollHeight > this.height();
                            }
                        })(jQuery);
                        $(function () {
                            scope.hasScroll = $('#my_div1').hasScrollBar();
                        });
                    }, 0);
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
                            initData();
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
                                noteId: scope.data.id,
                                note: {note: scope.data.note}}).then(function (res) {
                        if (scope.hasRetrieve)
                            initData();
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
                            noteId: noteId}).then(function (res) {
                    if (scope.hasRetrieve)
                        initData();
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
            scope.loadMoreNotes = function () {
                if (scope.loading !== true && scope.allLoaded !== true) {
                    scope.loading = true;
                    scope.searchParams.pageNo++;
                    scope.rerenderDataTable();
                }
            };

            initData();
        },
        templateUrl: function (elem, attrs) {
            return appHelper.viewTemplatePath('common', 'notes-directive');
        }
    };
});