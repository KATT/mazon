var MasonryLayout = require('./lib/layout');


var defaultOptions = {
  columnWidth: 100,
  gutter: 20,
};

function extend(o1, o2) {
  for (var k in o2) {
    if (o2.hasOwnProperty(k)) {
      o1[k] = o2[k];
    }
  }
  return o1;
}

function Masonry(elementID, opts) {
  this.elementID = elementID
	this.element = document.getElementById(elementID);

  this.options = {};
  this.options = extend(this.options, defaultOptions);
  this.options = extend(this.options, opts);

  this.reLayout();
}



Masonry.prototype.filterItems = function() {
  // TODO filterItems
};


Masonry.prototype.sortItems = function() {
  // TODO sortItems
};

Masonry.prototype.positionItemToPoint = function($item, point) {
  var x = point.x * this.options.columnWidth;
  var y = point.y * this.rowHeight;

  console.log($item, x, y, point);

  // temp, change to translate3d
  $item.style.position = 'absolute';

  $item.style.left = x + 'px';
  $item.style.top = y + 'px';
};

Masonry.prototype.calculateRowHeight = function() {
  var len = this.items.length;
  var rowHeight = 200; // neeeh

  for (var i = 0; i < len; i++) {
    var $item = this.items[i];
    var $itemHeight = $item.offsetHeight
    if (!$itemHeight) {
      continue;
    }
    rowHeight = Math.min(rowHeight, $item.offsetHeight)
  }

  this.rowHeight  = rowHeight;
};

Masonry.prototype.reLayout = function() {
  this.items = this.element.children;

  this.filterItems();
  this.sortItems();

  this.calculateRowHeight();

  var nCols = Math.floor(this.element.offsetWidth / this.options.columnWidth);
  var layout = new MasonryLayout(nCols);

  console.log('rowHeight', this.rowHeight);
  console.log('nCols', nCols);

  var len = this.items.length;
  for (var i = 0; i < len; i++) {
    var $item = this.items[i];

    var itemColSpan = Math.ceil($item.offsetWidth / this.options.columnWidth);
    var itemRowSpan = Math.ceil($item.offsetHeight / this.rowHeight);


    var position = layout.addRect(itemColSpan, itemRowSpan);

    this.positionItemToPoint($item, position);

  }
};

module.exports = Masonry;