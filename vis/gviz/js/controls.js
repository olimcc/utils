/**
 * Custom Gviz controls.
 */
domutil = {};

domutil.createElem = function(tag, opts) {
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
 * @param {element} container in dom
 * @param {String} type 'multi' or 'single' selection
 * @param {Object} config for UI values
 * @param {Function} cb callback on click of ui element
 */
var ColumnFilterUi = function(container, type, config, cb) {
    this.container_ = container;
    this.type_ = type;
    this.config_ = config;
    this.cb_ = cb;
    return this;
};

/**
 * Draw UI.
 */
ColumnFilterUi.prototype.draw = function() {
  // build UI
  var self = this;
  for (var i=0;i<this.config_.length;i++) {
      var cfg = this.config_[i];
      var div = domutil.createElem('div');
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
      var radio = domutil.createElem('input', selectorOpts);
      var label = domutil.createElem('label', {innerHTML: cfg.label});

      // build div and draw
      div.appendChild(radio);
      div.appendChild(label);
      this.container_.appendChild(div);
  }
}

/**
 * Controller for column filter
 *
 * @param {element} container in dom
 */
var ColumnFilter = function(container) {
    this.container_ = container;
    this.datatable_ = null;
};

/**
 * Draw our  filter UI
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

    var selectCallback = function(value) {
        self.st_.selectedValues = value;
        google.visualization.events.trigger(self, 'ready', null);
    }

    var cfui = new ColumnFilterUi(
      this.container_, 'single', cfg, selectCallback).draw();

    google.visualization.events.trigger(self, 'ready', null);
};

ColumnFilter.prototype.applyOperator = function () {
    var self = this;
    var cols = this.fc_.filter(function(v) {
      return v != self.st_.selectedValues;
    });
    var dv = new google.visualization.DataView(this.datatable_);
    dv.hideColumns(cols);
    return dv;
};