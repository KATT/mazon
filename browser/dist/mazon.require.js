require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

function MasonryLayoutPoint(x, y) {
  this.x = Number(x);
  this.y = Number(y);
}


module.exports = MasonryLayoutPoint;
},{}],2:[function(require,module,exports){
var MasonryLayoutPoint = require('./layout-point');

/**
 * MasonryLayout, helps where to put rectangles in an X*Y grid,
 * automatically extending vertically
 *
 * @param {Number} Number of columns that this layout contains
 */
function MasonryLayout(_nCols, matrix) {
  this._nCols = _nCols;
  this._matrix = matrix || [];
}

/**
 * Finds next free point in matrix
 *
 * @param  {Number} Number of points to ignore
 * @return {MasonryLayoutPoint}
 */
MasonryLayout.prototype._findNextFreePoint = function(skip) {
  var cols, i, isTaken, x, y, _matrix;
  if (!skip) {
    skip = 0;
  }

  i = 0;
  _matrix = this._matrix;

  // Step through rows in matrix
  for (y = 0; y < _matrix.length; y++) {
    cols = _matrix[y];
    // Step through cols
    for (x = 0; x < cols.length; x++) {
      // Is this space free?
      isTaken = cols[x];
      if (!isTaken) {
        if (skip <= i++) {
          return new MasonryLayoutPoint(x, y);
        }
      }
    }
  }

  // we didn't find any free space in the whole Matrix!
  // return first position of next line
  return new MasonryLayoutPoint(0, _matrix.length);
};

MasonryLayout.prototype._addNewRow = function() {
  var y = this._matrix.length;

  this._matrix[y] = [];
  for (var i=0; i < this._nCols; i++) {
    this._matrix[y][i] = 0;
  }
};


/**
 * Check if a point in the matrix fits to hold a rectangle with size
 *
 * @param  {MasonryLayoutPoint} position
 * @param  {Number} width
 * @param  {Number} height
 * @return {Boolean}
 */
MasonryLayout.prototype._checkIfPointFitsRect = function(position, width, height) {
  var dx, i, x, y, j, col, row, matrix;


  matrix = this._matrix;

  x = position.x;
  y = position.y;

  // test out of bounds
  var outOfBoundsX = (x+width > this._nCols);
  if (outOfBoundsX) {
    return false;
  }

  // see if all the points are empty
  for (i = 0; i < height; i++) {
    row = (y+i);
    if (!matrix[row]) {
      // row doesn't exist
      // no row will exist after either
      return true;
    }
    // step through this row's columns
    for (j = 0; j < width; j++) {
      col = (x+j);

      // test busy
      if (matrix[row][col] === 1) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Get first available position for rectangle
 *
 * @param  {Number} width
 * @param  {Number} height
 * @throws {Error} if the grid is too small to fit rect
 * @return {MasonryLayoutPoint}
 */
MasonryLayout.prototype.getPositionForRect = function(width, height) {
  var position, found, i;

  i = 0;
  found = false;
  if (width > this._nCols) {
    throw new Error('Layout matrix is too small to fit any rectangle width width ' + width);
  }

  while (true) {
    position = this._findNextFreePoint(i++);

    if (this._checkIfPointFitsRect(position, width, height)) {
      return position;
    }
  }
  return position;
};

/**
 * Add a rectangle to matrix
 * @param {Number} width
 * @param {Number} height
 * @return {MasonryLayoutPoint}
 */
MasonryLayout.prototype.addRect = function(width, height) {
  var position = this.getPositionForRect(width, height);
  var y = position.y;
  var x = position.x;
  var i;
  var j;

  for (i = 0; i < height; i++) {
    // add new row if needed
    if (!this._matrix[y+i]) {
      this._addNewRow();
    }

    // add block on width and height
    for (j = 0; j < width; j++) {
      this._matrix[y+i][j+x] = 1;
    }
  }


  return position;
};


MasonryLayout.prototype.getNumberOfRows = function() {
  return this._matrix.length;
};


module.exports = MasonryLayout;

},{"./layout-point":1}],"GRD031":[function(require,module,exports){
var MasonryLayout = require('./lib/layout');


var defaultOptions = {
  columnWidth: 100,
  rowHeight: 100,
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
  this.viewportID = elementID;
	this.viewport = document.getElementById(elementID);

  this.options = {};
  this.options = extend(this.options, defaultOptions);
  this.options = extend(this.options, opts);

  this.reLayout();
}



Masonry.prototype.filterItems = function() {
  this.filteredItems = [];

  var len = this.items.length;
  for (var i = 0; i < len; i++) {
    var $item = this.items[i];
    // TODO
    // toggle "hidden" classes to $item
    // add vissible `this.filteredItems`
    if (true) {
      this.filteredItems.push($item);
    }
  }
};


Masonry.prototype.sortItems = function() {

  // TODO
  // Change the order of `this.viewport.children`s in the DOM
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
  var y = point.y * this.options.rowHeight;

  x += (this.options.gutterSize * point.x);
  y += (this.options.gutterSize * point.y);


  this.setItemPosition($item, x, y);
};

Masonry.prototype.getItemLayoutSpan = function($item) {
  // TODO
  // move gutter math into MasonryLayout component/subclass?
  // make MasonryLayoutSpan for this object?

  // how many col/rows does this item occupy
  var itemColSpan = $item.offsetWidth  / this.options.columnWidth;
  var itemRowSpan = $item.offsetHeight / this.options.rowHeight;

  // don't include the gutter in the calculation
  itemColSpan -= (this.options.gutterSize/this.options.columnWidth) * Math.floor(itemColSpan - 1);
  itemRowSpan -= (this.options.gutterSize/this.options.rowHeight) * Math.floor(itemRowSpan - 1);

  // round up
  itemColSpan = Math.ceil(itemColSpan);
  itemRowSpan = Math.ceil(itemRowSpan);

  return {
    width: itemColSpan,
    height: itemRowSpan
  }
};

Masonry.prototype.positionItems = function() {
  var len = this.items.length;
  for (var i = 0; i < len; i++) {
    var $item = this.filteredItems[i];

    var span = this.getItemLayoutSpan($item);
    var position = this.layout.addRect(span.width, span.height);

    this.positionItemToPoint($item, position);
  }
};

Masonry.prototype.calculateNumberOfColumns = function() {

  var viewPortExtraGutter = (this.viewport.offsetWidth + this.options.gutterSize);
  var columnWidthWithGutter = (this.options.columnWidth + this.options.gutterSize);

  var nCols = viewPortExtraGutter / columnWidthWithGutter;


  this.numberOfColumns = Math.floor(nCols);
};

Masonry.prototype.resizeViewPort = function() {
  var numberOfRows = this.layout.getNumberOfRows();

  // auto-adjusts on width
  // var width = (this.numberOfColumns * this.options.columnWidth) + (this.numberOfColumns-1) * this.options.gutterSize;
  var height = (numberOfRows * this.options.rowHeight) + (numberOfRows-1) * this.options.gutterSize;

  this.viewport.style.height = height + 'px';
};

Masonry.prototype.reLayout = function() {
  this.items = [].slice.call(this.viewport.children);

  this.filterItems();
  this.sortItems();

  this.calculateNumberOfColumns();

  this.layout = new MasonryLayout(this.numberOfColumns);

  this.positionItems();

  this.resizeViewPort();

  // TODO
  // some kind of trigger when reLayout is done?
  // could be used to clean up un-used items from the DOM tree etc
};

module.exports = Masonry;
},{"./lib/layout":2}],"/Users/ajax/dev/mazon/mazon.js":[function(require,module,exports){
module.exports=require('GRD031');
},{}]},{},["GRD031"])
;