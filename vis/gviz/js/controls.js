/**
 * Additional Google Visualization control elements to add to the standard
 * packages made available by Gviz Controls and Dashboards.
 *
 * Filters added:
 * 1. ColumnFilter: Allow a user to toggle between visible column
 * 2. PivotOperator: Perform a pivot operation between visualizations
 *
 * Controls can take one of two forms:
 *  - Visible Control: Controls that render a UI of some form, and apply
 *    changes to a table based on user selection. Generally filters values in
 *    a single column, but DataTable structure remains unchanged.
 *  - Operator: Applys a change to the format of a datatable between
 *    visualizations. May not neccessarily filter based on columns, but may
 *    perform some type of aggregation, grouping, or row/column attribute
 *    changes.
 *
 * The standard method for adding your own controls looks roughly like this:
 *    var MyControl = function(container) {};
 *    MyControl.prototype.draw = function (datatable, options, state) {
 *        // Draw UI elements, attach handlers etc
 *        google.visualization.events.trigger(self, 'ready', null);
 *    };
 *    MyControl.prototype.applyOperator = function() {
 *      // Perform updates/filters on DataTable before returning
 *      // Called each time a change is triggered/flows through dashboard.
 *      return this.datatable;
 *    }
 */

/**
 * Controller for column filter.
 *
 * A column filter facilitates the selection between the display of certain
 * columns in a visualization.
 * Options:
 *  filterableColumns: <Array> column indexes to choose between
 * State:
 *  selectedValues: <Number> column index to default to
 *
 * Sample use case: Allowing a user to toggle between the display of certain
 * columns in a line chart to reduce noise.
 *
 * @param {element} container
 */
var ColumnFilter = function(container) {
    this.container_ = container;
    this.datatable_ = null;
};

/**
 * Set up our filter.
 *
 * @param {google.visualization.DataTable} datatable
 * @param {Object} options for config
 * @param {Object} state of filter
 */
ColumnFilter.prototype.draw = function (datatable, options, state) {
    this.datatable_ = datatable;
    this.opts_ = options;
    this.fc_ = this.opts_.filterableColumns;
    this.st_ = state;
    var self = this;

    var cfg = [];
    for (var i = 0; i<this.fc_.length; i++) {
      cfg.push({
        label: this.datatable_.getColumnLabel(this.fc_[i]),
        value: this.fc_[i],
        checked: (this.st_.selectedValues == this.fc_[i])
      });
    }
    // should be triggered on selection in UI
    var selectCallback = function(value) {
        self.st_.selectedValues = value;
        google.visualization.events.trigger(self, 'ready', null);
    }
    // start our UI
    var cfui = new ColumnFilterUi(this.container_).
                   draw('single', cfg, selectCallback);

    google.visualization.events.trigger(self, 'ready', null);
};

/**
 * Process and return a set of data. Called on change, or when a feeding
 * control changes.
 */
ColumnFilter.prototype.applyOperator = function () {
    var self = this;
    var cols = this.fc_.filter(function(v) {
      return v != self.st_.selectedValues;
    });
    var dv = new google.visualization.DataView(this.datatable_);
    dv.hideColumns(cols);
    return dv;
};

/**
 * Base class for UI elements.
 * @todo(olimcc) potentially too elaborate
 */
var BaseUI = function() {}

BaseUI.prototype.createElem = function(tag, opts) {
    var element = document.createElement(tag);
    for (var opt in opts) {
        if (['innerHTML', 'onclick'].indexOf(opt) != -1) {
            element[opt] = opts[opt];
        } else {
            element.setAttribute(opt, opts[opt]);
        }
    }
    return element;
}

/**
 * UI controller for column filter
 *
 * Facilitates rendering of radio fields in conjunction with ColumnFilter.
 *
 * @param {element} container in dom
 */
var ColumnFilterUi = function(container) {
    this.container_ = container;
    return this;
};

/* Inherit */
ColumnFilterUi.prototype = new BaseUI();

/**
 * Draw UI.
 * @param {String} type 'multi' or 'single' selection
 * @param {Object} config for UI values
 * @param {Function} cb callback on click of ui element
 */
ColumnFilterUi.prototype.draw = function(type, config, cb) {
  // build UI
  this.type_ = type;
  this.config_ = config;
  this.cb_ = cb;
  var self = this;

  for (var i=0;i<this.config_.length;i++) {
      var cfg = this.config_[i];
      var div = this.createElem('div');
      var selectorOpts = {
        type: 'radio',
        value: cfg.value,
        name: 'dt-filter',
        onclick: function() {self.cb_(this.value, this)}
      };
      if (cfg.checked) {
        selectorOpts['checked'] = true;
      }
      // create radio and label
      var radio = this.createElem('input', selectorOpts);
      var label = this.createElem('label', {innerHTML: cfg.label});

      // build div and draw
      div.appendChild(radio);
      div.appendChild(label);
      this.container_.appendChild(div);
  }
}


/**
 * A gvizpivot.PivotTable() operator wrapper.
 *
 * Facilitates pivoting values in a datatable before sending to the next
 * visualization.
 *
 * Sample use case: A column holds multiple categories, a second column holds
 *  values for each row. You would like to convert categories in the single
 *  column to individual, aggregated columns before sending to a linechart/table.
 */
var PivotOperator = function(container) {
  if (!gvizpivot) {
    throw('Could not find the gvizpivot library.')
  }
  this.container_ = container;
}

/**
 * Set up our operator.
 *
 * @param {google.visualization.DataTable} datatable
 * @param {Object} options for config
 * @param {Object} state of filter
 *
 * Note:
 *   `options` expects a full configuration for a pivottable
 *   as detailed here: https://github.com/olimcc/gviz-pivottable
 *   It also accepts an optional entry: preDrawCallback
 *   If this key is provided, the returned DataTable will be passed to this
 *   function before drawing. This callback should return the DataTable.
 */
PivotOperator.prototype.draw = function (datatable, options, state) {
  this.datatable_ = datatable;
  this.options_ = options;
  google.visualization.events.trigger(this, 'ready', null);
}

/* Apply */
PivotOperator.prototype.applyOperator = function() {
  var pivot = new gvizpivot.PivotAgg(
      this.datatable_,
      this.options_);
  var res = pivot.getDataTable();
  if (this.options_.preDrawCallback) {
    return this.options_.preDrawCallback(pivot.getDataTable());
  } else {
    return pivot.getDataTable();
  }
};



