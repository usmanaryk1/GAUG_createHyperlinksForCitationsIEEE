	angular
	  .module('mwl.calendar')
	  .factory('calendarHelper', ["$filter", "moment", "calendarConfig", function($filter, moment, calendarConfig) {
	    function formatDate(date, format) {
	      if (calendarConfig.dateFormatter === 'angular') {
	        return $filter('date')(moment(date).toDate(), format);
	      } else if (calendarConfig.dateFormatter === 'moment') {
	        return moment(date).format(format);
	      }
	    }

	    function adjustEndDateFromStartDiff(oldStart, newStart, oldEnd) {
	      if (!oldEnd) {
	        return oldEnd;
	      }
	      var diffInSeconds = moment(newStart).diff(moment(oldStart));
	      return moment(oldEnd).add(diffInSeconds);
	    }

	    function eventIsInPeriod(event, periodStart, periodEnd) {

	      var eventStart = moment(event.startsAt);
	      var eventEnd = moment(event.endsAt || event.startsAt);
	      periodStart = moment(periodStart);
	      periodEnd = moment(periodEnd);

	      if (angular.isDefined(event.recursOn)) {

	        switch (event.recursOn) {
	          case 'year':
	            eventStart.set({
	              year: periodStart.year()
	            });
	            break;

	          case 'month':
	            eventStart.set({
	              year: periodStart.year(),
	              month: periodStart.month()
	            });
	            break;

	          default:
	            throw new Error('Invalid value (' + event.recursOn + ') given for recurs on. Can only be year or month.');
	        }

	        eventEnd = adjustEndDateFromStartDiff(event.startsAt, eventStart, eventEnd);

	      }

	      return (eventStart.isAfter(periodStart) && eventStart.isBefore(periodEnd)) ||
	        (eventEnd.isAfter(periodStart) && eventEnd.isBefore(periodEnd)) ||
	        (eventStart.isBefore(periodStart) && eventEnd.isAfter(periodEnd)) ||
	        eventStart.isSame(periodStart) ||
	        eventEnd.isSame(periodEnd);

	    }

	    function filterEventsInPeriod(events, startPeriod, endPeriod) {
	      return events.filter(function(event) {
	        return eventIsInPeriod(event, startPeriod, endPeriod);
	      });
	    }

	    function getEventsInPeriod(calendarDate, period, allEvents) {
	      var startPeriod = moment(calendarDate).startOf(period);
	      var endPeriod = moment(calendarDate).endOf(period);
	      return filterEventsInPeriod(allEvents, startPeriod, endPeriod);
	    }

	    function getBadgeTotal(events) {
	      return events.filter(function(event) {
	        return event.incrementsBadgeTotal !== false;
	      }).length;
	    }

	    function getWeekDayNames() {
	      var weekdays = [];
	      var count = 0;
	      while (count < 7) {
	        weekdays.push(formatDate(moment().weekday(count++), calendarConfig.dateFormats.monthDay));
	      }
	      return weekdays;
	    }

	    function getMonthView(events, currentDay) {

	      var startOfMonth = moment(currentDay).startOf('month');
	      var day = startOfMonth.clone().startOf('week');
	      var endOfMonthView = moment(currentDay).endOf('month').endOf('week');
	      var eventsInPeriod;
	      if (calendarConfig.displayAllMonthEvents) {
	        eventsInPeriod = filterEventsInPeriod(events, day, endOfMonthView);
	      } else {
	        eventsInPeriod = filterEventsInPeriod(events, startOfMonth, startOfMonth.clone().endOf('month'));
	      }
	      var view = [];
	      var today = moment().startOf('day');

	      while (day.isBefore(endOfMonthView)) {

	        var inMonth = day.month() === moment(currentDay).month();
	        var monthEvents = [];
	        if (inMonth || calendarConfig.displayAllMonthEvents) {
	          monthEvents = filterEventsInPeriod(eventsInPeriod, day, day.clone().endOf('day'));
	        }

	        var cell = {
	          label: day.date(),
	          date: day.clone(),
	          inMonth: inMonth,
	          isPast: today.isAfter(day),
	          isToday: today.isSame(day),
	          isFuture: today.isBefore(day),
	          isWeekend: [0, 6].indexOf(day.day()) > -1,
	          events: monthEvents,
	          badgeTotal: getBadgeTotal(monthEvents)
	        };

	        //cellModifier({calendarCell: cell});

	        view.push(cell);

	        day.add(1, 'day');
	      }

	      return view;

	    }

	    function getWeekView(events, currentDay,list) {
	      var startOfWeek = moment(currentDay).startOf('week');
	      var endOfWeek = moment(currentDay).endOf('week');
	      var dayCounter = startOfWeek.clone();
	      var days = [];
	      var eventdays = [];
	      var today = moment().startOf('day');
	      while (days.length < 7) {
	        days.push({
	          weekDayLabel: formatDate(dayCounter, calendarConfig.dateFormats.weekDay),
	          date: dayCounter.clone(),
	          dayLabel: formatDate(dayCounter, calendarConfig.dateFormats.day),
	          isPast: dayCounter.isBefore(today),
	          isToday: dayCounter.isSame(today),
	          isFuture: dayCounter.isAfter(today),
	          isWeekend: [0, 6].indexOf(dayCounter.day()) > -1
	        });
	        dayCounter.add(1, 'day');
	      }
	      eventdays = days;
	      console.log(events);
	      _.each(list, function (n){
	      	 	n.temp_events = _.filter(events, function (data){
	      	 		return data.employeeId == n.id
	      	 	})
	     	})

	        _.each(list, function (n) {
	        	n.days = [];
	        	_.each(eventdays, function (f) {
	        		var e = {};
	        		angular.copy(f,e);
	        		e.events = _.filter(n.temp_events, function (content){
	        							return moment(f.date).isSame(moment(new Date(content.startDate)));
	        					})
	        		n.days.push(e);
	        	})
	        })
	        console.log(list);

	      return {days: days, list:list};

	    }

	    return {
	      getWeekDayNames: getWeekDayNames,
	      getMonthView: getMonthView,
	      getWeekView: getWeekView,
	      adjustEndDateFromStartDiff: adjustEndDateFromStartDiff,
	      formatDate: formatDate,
	      eventIsInPeriod: eventIsInPeriod //expose for testing only
	    };

	  }]);