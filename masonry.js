var MasonryLayout = require('./lib/layout');


var defaultOptions = {
  columnWidth: 100,
  gutterSize: 10,
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
  // TODO
  // loop through this.items
  // toggle "hidden" classes to items
  // add vissible `this.filteredItems`

  // (temp) copy filtered items
  this.filteredItems = this.items.slice(0);
};


Masonry.prototype.sortItems = function() {

  // TODO
  // Change the order of `this.element.children`s' in the DOM
  // only care about position of `this.filteredItems`

};


Masonry.prototype.setItemPosition = function($item, x, y) {
  x += 'px';
  y += 'px';

  var isFirstTime = ($item.style.position !== 'absolute'); // TODO better check
  if (isFirstTime) {
    $item.style.position = 'absolute'

    // make sure we don't animate in on render
    // TODO should probably be re-written once we get into adding
    $item.style.display = 'none';
    $item.offsetHeight;
    $item.style.display = 'block';
  }

  // TODO below, check for translate3d support + vendor prefix
  if (true) {
    $item.style.webkitTransform = 'translate3d('+x+','+y+',0)';
  } else {
    $item.style.left = x;
    $item.style.top = y;
  }
};

Masonry.prototype.positionItemToPoint = function($item, point) {
  var x = point.x * this.options.columnWidth;
  var y = point.y * this.rowHeight;

  x += (this.options.gutterSize * point.x);
  y += (this.options.gutterSize * point.y);


  this.setItemPosition($item, x, y);
};

Masonry.prototype.calculateRowHeight = function() {
  var len = this.items.length;
  var rowHeight = 200; // FIXME

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
Masonry.prototype.calculateNumberOfColumns = function() {
  var nCols = (this.element.offsetWidth / this.options.columnWidth);
  var nColsMinusGutters = (this.element.offsetWidth + this.options.gutterSize) / (this.options.columnWidth + this.options.gutterSize);
  console.log('w/o gutters', nCols);
  console.log('w gutters', nColsMinusGutters);

  this.numberOfColumns = Math.floor(nColsMinusGutters);
};

Masonry.prototype.reLayout = function() {
  this.items = [].slice.call(this.element.children);

  this.filterItems();
  this.sortItems();

  this.calculateRowHeight();
  this.calculateNumberOfColumns();

  var layout = new MasonryLayout(this.numberOfColumns);

  var len = this.items.length;
  for (var i = 0; i < len; i++) {
    var $item = this.items[i];

    var itemColSpan = $item.offsetWidth / this.options.columnWidth;
    itemColSpan -= (this.options.gutterSize/this.options.columnWidth) * Math.floor(itemColSpan - 1);
    itemColSpan = Math.ceil(itemColSpan);

    var itemRowSpan = $item.offsetHeight / this.rowHeight;
    itemRowSpan -= (this.options.gutterSize/this.rowHeight) * Math.floor(itemRowSpan - 1);
    itemRowSpan = Math.ceil(itemRowSpan);


    var position = layout.addRect(itemColSpan, itemRowSpan);

    this.positionItemToPoint($item, position);

  }
};

module.exports = Masonry;