	angular
	  .module('mwl.calendar')
	  .factory('calendarTitle', ["moment", "calendarConfig", "calendarHelper", function(moment, calendarConfig, calendarHelper) {

	    function day(currentDay) {
	      return calendarHelper.formatDate(currentDay, calendarConfig.titleFormats.day);
	    }

	    function week(currentDay) {
	    	//return calendarHelper.formatDate(currentDay, calendarConfig.titleFormats.week);
	      var weekTitleLabel = calendarConfig.titleFormats.week;
	      return weekTitleLabel.replace('{month}', moment(currentDay).format('MMM'))
	      						.replace('{startDate}', moment(currentDay).format('D'))
	      						.replace('{endDate}', moment(currentDay).weekday(6).format('D'))
	      						.replace('{year}', moment(currentDay).format('YYYY'));
	    }

	    function month(currentDay) {
	      return calendarHelper.formatDate(currentDay, calendarConfig.titleFormats.month);
	    }

	    function year(currentDay) {
	      return calendarHelper.formatDate(currentDay, calendarConfig.titleFormats.year);
	    }

	    return {
	      day: day,
	      week: week,
	      month: month,
	      year: year
	    };

	  }]);