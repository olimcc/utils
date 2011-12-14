/* Gviz helpers */
var vis = viz || {};
vis.helpers = {};

/* sum array */
vis.helpers.sum = function(arr) {
  for(var i=0,sumv=0;i<arr.length;sumv+=arr[i++]);
  return sumv;
}

/* max array */
vis.helpers.max = function(arr) {
  return Math.max.apply({}, arr);
}

/* min array */
vis.helpers.min = function(arr) {
  return Math.min.apply({}, arr);
}

/* get range between numbers */
vis.helpers.range = function(begin, end) {
    var r = [];
    if (begin > end) return -1;
    while (begin!=end) {
      r.push(begin);
      begin++;
    }
    return r;
}

vis.utils = {};
/**
 * Get an array of rows that match a certain query
 *
 * @param {google.visualization.DataTable} dt datatable.
 * @param {String|Number} fi filter to search for.
 * @param {Number} ci column index.
 *
 * @returns {Array} values
 */
vis.utils.getFilteredRows = function(dt, fi, ci) {
  var r = [], n = dt.getNumberOfRows();
  for (var i=0;i<n;i++) {
    var val = dt.getValue(i, ci);
    if (String(val) == String(fi)) {r.push(i);}
  }
  return r;
}

/**
 * Get an array of rows that match a certain regexp query
 *
 * @param {google.visualization.DataTable} dt datatable.
 * @param {String|Number} fi regexp filter to search for.
 * @param {Number} ci column index.
 *
 * @returns {Array} values
 */
vis.utils.getFilteredRowsRegexp = function(dt, rfi, ci) {
  var reg = new RegExp(String(rfi));
  var n = dt.getNumberOfRows();
  var r = [];
  for (var i=0;i<n;i++) {
    var t = reg.test(dt.getValue(i, ci));
    if (t) {r.push(i)}
  }
  return r;
}

/**
 * Get entries from a column.
 *
 * @param {google.visualization.DataTable} dt datatable.
 * @param {Number} ci column index.
 *
 * @returns {Array} values
 */
vis.utils.getColEntries = function (dt, ci) {
    var r = [];
    for (var m=0;m<dt.getNumberOfRows();m++) {
        r.push(dt.getValue(m, ci));
    }
    return r;
}

/**
 * Get entries from a column represented as a percentage of column total.
 *
 * @param {google.visualization.DataTable} dt datatable.
 * @param {Number} ci column index.
 *
 * @returns {Array} values
 */
vis.utils.getPercentTotalArray = function(dt, ci) {
  var colValues = vis.utils.getColEntries(dt, ci);
  var sumOfCol = viz.helpers.sum(colValues);
  var res = [];
  for (var k=0; k<colValues.length; k++) {
    res.push(colValues[k]/sumOfCol);
  }
  return res;
}

/**
 * Add a percentage total column to datatable.
 *
 * @param {google.visualization.DataTable} dt datatable.
 * @param {Number} ci column index.
 * @param {String} opt_cl optional column label.
 * @param {Function} opt_modFunc optional value modifier function.
 *
 * @returns {google.visualization.DataTable} dt.
 */
visutils.addPercentTotalColumn = function(dt, ci, opt_cl, opt_modFunc) {
  var label = opt_col_label || '% tot - ' + dt.getColumnLabel(ci);
  var newCol = dt.addColumn('number', label);
  var arr = vis.utils.getPercentTotalArray(dt, ci);
  for (var i=0;i<dt.getNumberOfRows();i++) {
    var val = (opt_modFunc) ? opt_modFunc(arr[i]) : arr[i];
    dt.setValue(i, newCol, val);
  }
  return dt;
}
