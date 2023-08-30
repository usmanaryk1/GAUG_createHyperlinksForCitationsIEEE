'use strict';

angular.module('xenon.filter', [])
        .filter('tel', function() {
            return function(tel) {
                if (!tel) {
                    return '';
                }

                var value = tel.toString().trim().replace(/^\+/, '');

                if (value.match(/[^0-9]/)) {
                    return tel;
                }

                var country, city, number;

                switch (value.length) {
                    case 10: // +1PPP####### -> C (PPP) ###-####
                        country = 1;
                        city = value.slice(0, 3);
                        number = value.slice(3);
                        break;

                    case 11: // +CPPP####### -> CCC (PP) ###-####
                        country = value[0];
                        city = value.slice(1, 4);
                        number = value.slice(4);
                        break;

                    case 12: // +CCCPP####### -> CCC (PP) ###-####
                        country = value.slice(0, 3);
                        city = value.slice(3, 5);
                        number = value.slice(5);
                        break;

                    default:
                        return tel;
                }

                if (country == 1) {
                    country = "";
                }

                number = number.slice(0, 3) + '-' + number.slice(3);

                return (country + " (" + city + ") " + number).trim();
            };
        }).filter('ssn', function() {
    return function(ssn) {
        if (!ssn) {
            return '';
        }

        var value = ssn.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return ssn;
        }

        ssn = ssn.slice(0, 3) + '-' + ssn.slice(3, 5) + '-' + ssn.slice(5);

        return ssn.trim();
    };
})
        .filter('duration', function() {
            return function(earlierdate, laterdate) {
                earlierdate = new Date(earlierdate);
                laterdate = new Date(laterdate);
                var difference = laterdate.getTime() - earlierdate.getTime();

//                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
//                difference -= daysDifference * 1000 * 60 * 60 * 24

                var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
                if (hoursDifference.toString().length == 1) {
                    hoursDifference = "0" + hoursDifference;
                }
                difference -= hoursDifference * 1000 * 60 * 60

                var minutesDifference = Math.floor(difference / 1000 / 60);
                difference -= minutesDifference * 1000 * 60
                if (minutesDifference.toString().length == 1) {
                    minutesDifference = "0" + minutesDifference;
                }

                var secondsDifference = Math.floor(difference / 1000);
                return hoursDifference + ":" + minutesDifference;
            };
        })
        .filter('timesheetformat', function() {
            return function(input) {
                var weekDays = ['Sn', 'Mn', 'Tu', 'Wd', 'Th', 'Fr', 'St'];
                return weekDays[new Date(input).getDay()];
            };
        })
        .filter('extension', function() {
            return function(input) {
                if(input && input!==null){
                    return input.substring(input.lastIndexOf("."))
                }else{
                    return input;
                }
                return weekDays[new Date(input).getDay()];
            };
        })
        .filter('durationtotal', ['$filter', function($filter) {
                return function(objList) {
                    var durationSum = 0;
                    angular.forEach(objList, function(obj) {
                        if (!isNaN(obj.roundedPunchOutTime) && !isNaN(obj.roundedPunchInTime) != null) {
                            var earlierdate = new Date(obj.roundedPunchInTime);
                            var laterdate = new Date(obj.roundedPunchOutTime);
                            durationSum += laterdate.getTime() - earlierdate.getTime();
                        }
                    });

//                    var daysDifference = Math.floor(durationSum / 1000 / 60 / 60 / 24);
//                    durationSum -= daysDifference * 1000 * 60 * 60 * 24

                    var hoursDifference = Math.floor(durationSum / 1000 / 60 / 60);
                    if (hoursDifference.toString().length == 1) {
                        hoursDifference = "0" + hoursDifference;
                    }
                    durationSum -= hoursDifference * 1000 * 60 * 60

                    var minutesDifference = Math.floor(durationSum / 1000 / 60);
                    durationSum -= minutesDifference * 1000 * 60
                    if (minutesDifference.toString().length == 1) {
                        minutesDifference = "0" + minutesDifference;
                    }
                    var secondsDifference = Math.floor(durationSum / 1000);
                    return hoursDifference + ":" + minutesDifference;
                }
            }]);


