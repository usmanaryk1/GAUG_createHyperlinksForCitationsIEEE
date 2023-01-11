'use strict';

angular.module('xenon.filter',[])
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

		ssn = ssn.slice(0, 3) + '-' + ssn.slice(3,5)+'-'+ssn.slice(5);

		return ssn.trim();
	};
});

