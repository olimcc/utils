/**
 * Custom Gviz controls.
 */

var createElem_ = function(tag, opts) {
  var element = document.createElement(tag);
  for (var opt in opts) {
    if (['innerHTML'].indexOf(opt) != -1) {
      element[opt] = opts[opt];
    } else {
      element.setAttribute(opt, opts[opt]);
    }
  }
  return element;
}

var ColumnFilter = function(container) {
  this.container_ = container;
  this.datatable_ = null;
  this.elementType_ = 'input';
};

ColumnFilter.prototype.draw = function(datatable, options, state) {
  this.datatable_ = datatable;
  this.opts_ = options;
  this.opts_.current = this.opts_.filterableColumns[this.opts_.filterableColumns.length-1]
  var self = this;
  var c = this.opts_.filterableColumns;

  for (var i=0;i<c.length;i++) {
    var div = createElem_('div');
    var radio = createElem_(
      this.elementType_, {type: 'radio', value: c[i], name: 'dt-filter', checked:'true'});
    var label = createElem_(
      'label', {innerHTML: this.datatable_.getColumnLabel(c[i])});

    radio.onclick = function() {
      self.opts_.current = this.value;
      google.visualization.events.trigger(self, 'ready', null);
    };

    div.appendChild(radio);
    div.appendChild(label);
    this.container_.appendChild(div);
  }
  google.visualization.events.trigger(self, 'ready', null);
};

ColumnFilter.prototype.applyOperator = function() {
  var self = this;
  var dv = new google.visualization.DataView(this.datatable_);
  var b = [];
  for (var i=0;i<this.opts_.filterableColumns.length;i++) {
    if (this.opts_.filterableColumns[i] != this.opts_.current) {
      b.push(this.opts_.filterableColumns[i]);
    }
  }
  dv.hideColumns(b);
  return dv;
};