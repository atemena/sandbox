(function () {
	"use strict";

	// http://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
	function zip(arrays) {
		return arrays[0].map(function(_,i) {
			return arrays.map(function(array) { return array[i]; });
		});
	}

	function isInt(n) {
		return +n === n && (!(n % 1));
	}

	function isZero(n, precision) {
		// Returns true if the number is essentially zero within a certain precision
		return false;
	}

	function isChildOf(parent, child) {
		var ancestor = child.parentElement;
		while(ancestor) {
			if(ancestor === parent)
				return true;
			ancestor = ancestor.parentElement;
		}
		return false;
	}

	function signSwitch(number, neg, pos, zero) {
		if(typeof number === 'string')
			number = number.replace(/,/g,'');
		if(number < 0)
			return neg;
		else if(number > 0)
			return pos;
		else
			return zero;
	}

	function download(filename, text) {
		var link = document.createElement('a');
		link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		link.setAttribute('download', filename);
		link.click();
	}

	function formatDate(date) {
		return '' + (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
	}

	function dateStr(date) {
		if(date === undefined)
			date = new Date();
		return '' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}

	// Compare two dates, ignoring times
	function compareDates(date1, date2) {
		if(date1.getFullYear() !== date2.getFullYear()) {
			if(date1.getFullYear() > date2.getFullYear())
				return 1;
			else
				return -1;
		}
		if(date1.getMonth() !== date2.getMonth()) {
			if(date1.getMonth() > date2.getMonth())
				return 1;
			else
				return -1;
		}
		if(date1.getDate() !== date2.getDate()) {
			if(date1.getDate() > date2.getDate())
				return 1;
			else
				return -1;
		}
		return 0;
	}

	function renderStartDatePast(date) {
		if(compareDates(date, new Date()) > 0)
			return 'disabled';
		if(compareDates(date, datepickerEnd.date) >= 0)
			return 'disabled';
		return '';
	}

	function renderEndDatePast(date) {
		if(compareDates(date, new Date()) > 0)
			return 'disabled';
		return '';
	}

	function renderStartDateFuture(date) {
		if(compareDates(date, new Date()) < 0)
			return 'disabled';
		return '';
	}

	function renderEndDateFuture(date) {
		if(compareDates(date, new Date()) < 0)
			return 'disabled';
		if(compareDates(date, datepickerStart.date) <= 0)
			return 'disabled';
		return '';
	}

	function dateRangeChanged(event) {
		if(event.data.past) {
			fiveDaysToEnd = datepickerEnd.date.valueOf() - (5*24*60*60*1000);
			if(datepickerStart.date.valueOf() > fiveDaysToEnd)
				datepickerStart.setValue(new Date(fiveDaysToEnd));
		} else {
			if(datepickerStart.date.valueOf() >= datepickerEnd.date.valueOf())
				datepickerEnd.setValue(new Date(datepickerStart.date.valueOf() + (24*60*60*1000)));
		}
		datepickerEnd.hide();
		datepickerStart.hide();
		if(event.data.callback)
			event.data.callback();
	}

	/* global $:false */
	function setupSimpleDateRange(dateChangedCallback, start, end, startId, endId) {
		var datepickerFormat = "mm/dd/yyyy";
		if(!start)
			start = new Date((new Date()).valueOf() - (30*24*60*60*1000));
		if(!end)
			end = new Date();
		if(!startId)
			startId = 'datepicker-start';
		if(!endId)
			endId = 'datepicker-end';
		if(compareDates(start, new Date()) < 0) {
			datepickerEnd = $('#' + endId).datepicker({ format: datepickerFormat, onRender: renderEndDatePast }).on('changeDate', {callback: dateChangedCallback, past: true}, dateRangeChanged).data('datepicker');
			datepickerStart = $('#' + startId).datepicker({ format: datepickerFormat, onRender: renderStartDatePast }).on('changeDate', {callback: dateChangedCallback, past: true}, dateRangeChanged).data('datepicker');
		}
		else {
			datepickerStart = $('#' + startId).datepicker({ format: datepickerFormat, onRender: renderStartDateFuture }).on('changeDate', {callback: dateChangedCallback, past: false}, dateRangeChanged).data('datepicker');	
			datepickerEnd = $('#' + endId).datepicker({ format: datepickerFormat, onRender: renderEndDateFuture }).on('changeDate', {callback: dateChangedCallback, past: false}, dateRangeChanged).data('datepicker');
		}
		datepickerEnd.setValue(end);
		datepickerStart.setValue(start);
	}

	/* global define:false, exports:false */
	if(typeof define === "function" && define.amd) {
		// AMD
		define({
			scale: 100.0,
			zip: zip,
			isInt: isInt,
			isZero: isZero,
			isChildOf: isChildOf,
			signSwitch: signSwitch,
			download: download,
			formatDate: formatDate,
			dateStr: dateStr,
			compareDates: compareDates,
			renderStartDatePast: renderStartDatePast,
			renderEndDatePast: renderEndDatePast,
			renderStartDateFuture: renderStartDateFuture,
			renderEndDateFuture: renderEndDateFuture,
			dateRangeChanged: dateRangeChanged,
			setupSimpleDateRange: setupSimpleDateRange
		});
	}
	else if (typeof exports === "object") {
		// CommonJS
		exports.scale = 100.0;
		exports.zip = zip;
		exports.isInt = isInt;
		exports.isZero = isZero;
		exports.isChildOf = isChildOf;
		exports.signSwitch = signSwitch;
		exports.download = download;
		exports.formatDate = formatDate;
		exports.dateStr = dateStr;
		exports.compareDates = compareDates;
		exports.renderStartDatePast = renderStartDatePast;
		exports.renderEndDatePast = renderEndDatePast;
		exports.renderStartDateFuture = renderStartDateFuture;
		exports.renderEndDateFuture = renderEndDateFuture;
		exports.dateRangeChanged = dateRangeChanged;
		exports.setupSimpleDateRange = setupSimpleDateRange;
	}
	else {
		// Global
		window.scale = 100.0;
		window.zip = zip;
		window.isInt = isInt;
		window.isZero = isZero;
		window.isChildOf = isChildOf;
		window.signSwitch = signSwitch;
		window.download = download;
		window.formatDate = formatDate;
		window.dateStr = dateStr;
		window.compareDates = compareDates;
		window.renderStartDatePast = renderStartDatePast;
		window.renderEndDatePast = renderEndDatePast;
		window.renderStartDateFuture = renderStartDateFuture;
		window.renderEndDateFuture = renderEndDateFuture;
		window.dateRangeChanged = dateRangeChanged;
		window.setupSimpleDateRange = setupSimpleDateRange;
	}
})();
