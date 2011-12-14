/**
 * Get a dates year and month value as a string.
 * @param {String} someDate date in string format.
 * @return {String} date in format: YYYY-MM.
 */

var getMonthFromDate = function(someDate, excludeDash) {
  var d = new Date(someDate);
  var yr = d.getFullYear();
  var mm = (d.getMonth() + 1 < 10) ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  var r = (excludeDash) ? yr + mm : yr + "-" + mm;
  return r;
}

/**
 * Get a dates year and month value as a string.
 * @param {String} someDate date in string format.
 * @return {String} date in format: YYYY-MM-DD.
 */

var getIsoDate = function(someDate, excludeDash) {
  var d = new Date(someDate);
  var yr = d.getFullYear();
  var mm = (d.getMonth() + 1 < 10) ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
  var dd = (d.getDate() < 10) ? '0' + d.getDate() : d.getDate();
  var r = (excludeDash) ? yr + mm + dd : yr + "-" + mm + "-" + dd;
  return r;
}

/**
 * Get the last day of a month.
 * @param {String} someDate date in string format.
 * @return {Date} date object of last day in month.
 */

var getLastDayOfMonth = function(someDate) {
  a = new Date(someDate);
  a.setMonth(a.getMonth() + 1);
  a.setDate(a.getDate() - 1);
  return a;
}

/**
 * Sum and round an array of numbers.
 * @param {Array<Numbers>} a array of numbers.
 * @return {Number} sum rounded to two decimal places.
 */

var sumAndRound = function(a) {
  for (var s = 0, i = 0; i < a.length; i++) {
    s += a[i];
  }
  return Math.round(s * 100) / 100;
}

/**
 * Avg and round an array of numbers.
 * @param {Array<Numbers>} a array of numbers.
 * @param {Number} dec number of decimal places.
 * @return {Number} avg rounded.
 */

var avgAndRound = function(a, dec) {
  for (var s = 0, i = 0; i < a.length; i++) {
    s += a[i];
  }
  s = s / a.length;
  var dec = (dec != undefined) ? dec : 2
  return Math.round(s * Math.pow(10, dec)) / Math.pow(10, dec);
}

/**
 * Function to get mean, variance, sdev of an array of numbers.
 * @param {Array<Numbers>} a array of numbers.
 * @return {Object} holding mean, variance, sdev of numbers;
 */
var stats = function(a) {
    var r = {
      mean: 0,
      variance: 0,
      deviation: 0
    },
      t = a.length;
    for (var m, s = 0, l = t; l--; s += a[l]);
    for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
    return r.deviation = Math.sqrt(r.variance = s / t), r;
  }

var changeOverTime = function(vals) {
    var oldV = vals[vals.length - 2];
    var newV = vals[vals.length - 1];
    if (oldV == 0 || newV == 0) {
      return 0;
    }
    var v = (newV - oldV) / oldV * 100
    return Math.round(v * 100) / 100;
  }

/**
 * Get URL params.
 * @return {Object} holding url param name => value.
 */

var getUrlVars = function() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
  function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

/**
 * Date sorter
 * Usage: array.sort(sortDates)
 */

var sortDates = function(a, b) {
  return new Date(a) - new Date(b);
}

function roundingModifier(val) {
  return Math.round(val * 10000) / 100;
}