(function () {
    function ComplaintInfoCtrl(complaint, $rootScope, $modal, $modalInstance, PatientDAO) {
        var ctrl = this;
        ctrl.complaint = complaint;


        ctrl.close = function () {
            $modalInstance.close();
        };

    };
    angular.module('xenon.controllers')
    .controller('ComplaintInfoCtrl', ["complaint", "$rootScope", "$modal", "$modalInstance", "PatientDAO", ComplaintInfoCtrl])
    .filter('customFilter', function () {
        return function (input) {

            // Check if the input contains underscores and replace them with spaces
            if (input.includes('_')) {
                input = input.replace(/_/g, ' ');
            }

            // Split the input string into an array of words
            var words = input.split(' ');

            // Transform each word (capitalize first letter and make the rest lowercase)
            var transformedWords = words.map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            });

            // Join the transformed words into a sentence
            var transformedSentence = transformedWords.join(' ');

            return transformedSentence;
        };
    });
})();