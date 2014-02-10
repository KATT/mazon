!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Mazon=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

},{"./layout-point":1}],3:[function(require,module,exports){
var MasonryLayout = require('./lib/layout');


var defaultOptions = {
  columnWidth: 100,
  rowHeight: 100,
  gutterSize: 10,
  filterCallback: null,
  sortCallback: null,
  hiddenClassName: 'hidden',
  hiddenStyle: {
    scale: 0.01
  },
  visibleStyle: {
    scale: 1
  }
};

function extend(o1, o2) {
  for (var k in o2) {
    if (o2.hasOwnProperty(k)) {
      o1[k] = o2[k];
    }
  }
  return o1;
}


// @link http://davidwalsh.name/vendor-prefix
var prefix = 'webkit';

var translate3d = true; // FIXME check for support


var hasClassName = function toggleClassName(element, className) {
  var hasClassNameRegEx = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');

  return hasClassNameRegEx.test(element.className);
};


var toggleClassName = function toggleClassName(element, className, show) {
  var hasClassNameRegEx = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');
  var classList = element.className;

  var newClassList = classList;
  if (show) {
    if (hasClassName(element, className)) {
      return;
    }
    newClassList += ' ' + className;
  } else {
    newClassList = classList.replace(hasClassNameRegEx, ' ');
  }
  // remove double spaces
  newClassList = newClassList.replace(/\s+/g, ' ');

  // trim whitespace
  newClassList = newClassList.replace(/(^\s+|\s+$)/g, '');

  element.className = newClassList;
};

function Masonry(elementID, opts) {
  this._viewportID = elementID;
  this._viewport = document.getElementById(elementID);

  this._options = {};
  this._options = extend(this._options, defaultOptions);
  this._options = extend(this._options, opts);

  this._filteredItems = [];
  this._hiddenItems = [];

  this.reLayout();
}



Masonry.prototype._filterItems = function() {
  this._filteredItems = [];
  this._hiddenItems = [];

  var len = this._items.length;
  for (var i = 0; i < len; i++) {
    var $item = this._items[i];

    var show = true;

    if (this._options.filterCallback) {
      show = this._options.filterCallback($item);
    }

    if (show) {
      this._filteredItems.push($item);
    } else {
      this._hiddenItems.push($item);
    }

    // update the CSS & styles
    toggleClassName($item, this._options.hiddenClassName, !show);

    var styles = show ? this._options.visibleStyle : this._options.hiddenStyle;
    $item._styles = $item._styles || {};
    $item._styles = extend($item._styles, styles);
  }
};


Masonry.prototype._sortItems = function() {
  var sortCallback = this._options.sortCallback;
  if (sortCallback) {
    this._filteredItems.sort(sortCallback);

    var len = this._filteredItems.length;
    for (var i = 0; i < len; i++) {
      var $item = this._filteredItems[i];

      this._viewport.appendChild($item);
    }

  }
};


Masonry.prototype._positionItemToPoint = function($item, point) {
  var x = point.x * this._options.columnWidth;
  var y = point.y * this._options.rowHeight;

  x += (this._options.gutterSize * point.x);
  y += (this._options.gutterSize * point.y);

  $item._styles = $item._styles || {};
  $item._styles = extend($item._styles, {
    x: x + 'px',
    y: y + 'px'
  });
};

Masonry.prototype._getItemLayoutSpan = function($item) {
  // TODO
  // move gutter math into MasonryLayout component/subclass?
  // make MasonryLayoutSpan for this object?
  // how many col/rows does this item occupy
  // memoize results?
  var itemColSpan = $item.offsetWidth  / this._options.columnWidth;
  var itemRowSpan = $item.offsetHeight / this._options.rowHeight;

  // don't include the gutter in the calculation
  itemColSpan -= (this._options.gutterSize/this._options.columnWidth) * Math.floor(itemColSpan - 1);
  itemRowSpan -= (this._options.gutterSize/this._options.rowHeight) * Math.floor(itemRowSpan - 1);

  // round up
  itemColSpan = Math.ceil(itemColSpan);
  itemRowSpan = Math.ceil(itemRowSpan);

  return {
    width: itemColSpan,
    height: itemRowSpan
  };
};

Masonry.prototype._positionItems = function() {
  var len = this._filteredItems.length;
  for (var i = 0; i < len; i++) {
    var $item = this._filteredItems[i];

    var span = this._getItemLayoutSpan($item);
    var position = this.layout.addRect(span.width, span.height);

    this._positionItemToPoint($item, position);
  }
};

Masonry.prototype._calculateNumberOfColumns = function() {

  var viewPortExtraGutter = (this._viewport.offsetWidth + this._options.gutterSize);
  var columnWidthWithGutter = (this._options.columnWidth + this._options.gutterSize);

  var nCols = viewPortExtraGutter / columnWidthWithGutter;


  this._numberOfColumns = Math.floor(nCols);
};

Masonry.prototype._resizeViewPort = function() {
  var numberOfRows = this.layout.getNumberOfRows();

  // auto-adjusts on width
  // var width = (this._numberOfColumns * this._options.columnWidth) + (this._numberOfColumns-1) * this._options.gutterSize;
  var height = (numberOfRows * this._options.rowHeight) + (numberOfRows-1) * this._options.gutterSize;

  this._viewport.style.height = height + 'px';
};

Masonry.prototype._resetItemTransforms = function() {
  var len = this._items.length;
  for (var i = 0; i < len; i++) {
    var $item = this._items[i];

    // FIXME don't edit the DOM object, have an internal hashmap instead
    $item._styles = {};
  }
};

Masonry.prototype._prepareItem = function($item) {
  // TODO better check
  var isFirstTime = ($item.style.position !== 'absolute');
  if (isFirstTime) {
    $item.style.position = 'absolute';

    // make sure we don't animate in on render
    // TODO should probably be re-written once we get into adding
    $item.style.display = 'none';
    var repaint = $item.offsetHeight;
    $item.style.display = 'block';
  }
};

Masonry.prototype._performItemTransforms = function() {
  var len = this._items.length;
  for (var i = 0; i < len; i++) {
    var $item = this._items[i];
    this._prepareItem($item);

    var x = $item._styles.x;
    var y = $item._styles.y;
    var scale = $item._styles.scale || 1;

    if (translate3d) {
      var transformStr = '';
      transformStr += 'translate3d('+x+','+y+',0) ';
      transformStr += 'scale3d('+scale+', '+scale+', 1)';

      $item.style[prefix + 'Transform'] = transformStr;

    } else {
      // TODO
    }
  }
};

/**
 * @public
 * @return Masonry
 */
Masonry.prototype.reLayout = function() {
  this._items = [].slice.call(this._viewport.children);

  this._filterItems();
  this._sortItems();

  this._calculateNumberOfColumns();

  this.layout = new MasonryLayout(this._numberOfColumns);

  this._positionItems();

  this._performItemTransforms();

  this._resizeViewPort();

  // TODO
  // some kind of trigger when reLayout is done?
  // could be used to clean up un-used items from the DOM tree etc
  //
  return this;
};

module.exports = Masonry;
},{"./lib/layout":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL2xpYi9sYXlvdXQtcG9pbnQuanMiLCIvVXNlcnMvYWpheC9kZXYvbWF6b24vbGliL2xheW91dC5qcyIsIi9Vc2Vycy9hamF4L2Rldi9tYXpvbi9tYXpvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5mdW5jdGlvbiBNYXNvbnJ5TGF5b3V0UG9pbnQoeCwgeSkge1xuICB0aGlzLnggPSBOdW1iZXIoeCk7XG4gIHRoaXMueSA9IE51bWJlcih5KTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnlMYXlvdXRQb2ludDsiLCJ2YXIgTWFzb25yeUxheW91dFBvaW50ID0gcmVxdWlyZSgnLi9sYXlvdXQtcG9pbnQnKTtcblxuLyoqXG4gKiBNYXNvbnJ5TGF5b3V0LCBoZWxwcyB3aGVyZSB0byBwdXQgcmVjdGFuZ2xlcyBpbiBhbiBYKlkgZ3JpZCxcbiAqIGF1dG9tYXRpY2FsbHkgZXh0ZW5kaW5nIHZlcnRpY2FsbHlcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gTnVtYmVyIG9mIGNvbHVtbnMgdGhhdCB0aGlzIGxheW91dCBjb250YWluc1xuICovXG5mdW5jdGlvbiBNYXNvbnJ5TGF5b3V0KF9uQ29scywgbWF0cml4KSB7XG4gIHRoaXMuX25Db2xzID0gX25Db2xzO1xuICB0aGlzLl9tYXRyaXggPSBtYXRyaXggfHwgW107XG59XG5cblxuXG4vKipcbiAqIEZpbmRzIG5leHQgZnJlZSBwb2ludCBpbiBtYXRyaXhcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IE51bWJlciBvZiBwb2ludHMgdG8gaWdub3JlXG4gKiBAcmV0dXJuIHtNYXNvbnJ5TGF5b3V0UG9pbnR9XG4gKi9cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLl9maW5kTmV4dEZyZWVQb2ludCA9IGZ1bmN0aW9uKHNraXApIHtcbiAgdmFyIGNvbHMsIGksIGlzVGFrZW4sIHgsIHksIF9tYXRyaXg7XG4gIGlmICghc2tpcCkge1xuICAgIHNraXAgPSAwO1xuICB9XG5cbiAgaSA9IDA7XG4gIF9tYXRyaXggPSB0aGlzLl9tYXRyaXg7XG5cbiAgLy8gU3RlcCB0aHJvdWdoIHJvd3MgaW4gbWF0cml4XG4gIGZvciAoeSA9IDA7IHkgPCBfbWF0cml4Lmxlbmd0aDsgeSsrKSB7XG4gICAgY29scyA9IF9tYXRyaXhbeV07XG4gICAgLy8gU3RlcCB0aHJvdWdoIGNvbHNcbiAgICBmb3IgKHggPSAwOyB4IDwgY29scy5sZW5ndGg7IHgrKykge1xuICAgICAgLy8gSXMgdGhpcyBzcGFjZSBmcmVlP1xuICAgICAgaXNUYWtlbiA9IGNvbHNbeF07XG4gICAgICBpZiAoIWlzVGFrZW4pIHtcbiAgICAgICAgaWYgKHNraXAgPD0gaSsrKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBNYXNvbnJ5TGF5b3V0UG9pbnQoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB3ZSBkaWRuJ3QgZmluZCBhbnkgZnJlZSBzcGFjZSBpbiB0aGUgd2hvbGUgTWF0cml4IVxuICAvLyByZXR1cm4gZmlyc3QgcG9zaXRpb24gb2YgbmV4dCBsaW5lXG4gIHJldHVybiBuZXcgTWFzb25yeUxheW91dFBvaW50KDAsIF9tYXRyaXgubGVuZ3RoKTtcbn07XG5cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLl9hZGROZXdSb3cgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHkgPSB0aGlzLl9tYXRyaXgubGVuZ3RoO1xuXG4gIHRoaXMuX21hdHJpeFt5XSA9IFtdO1xuICBmb3IgKHZhciBpPTA7IGkgPCB0aGlzLl9uQ29sczsgaSsrKSB7XG4gICAgdGhpcy5fbWF0cml4W3ldW2ldID0gMDtcbiAgfVxufTtcblxuXG4vKipcbiAqIENoZWNrIGlmIGEgcG9pbnQgaW4gdGhlIG1hdHJpeCBmaXRzIHRvIGhvbGQgYSByZWN0YW5nbGUgd2l0aCBzaXplXG4gKlxuICogQHBhcmFtICB7TWFzb25yeUxheW91dFBvaW50fSBwb3NpdGlvblxuICogQHBhcmFtICB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtICB7TnVtYmVyfSBoZWlnaHRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLl9jaGVja0lmUG9pbnRGaXRzUmVjdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBkeCwgaSwgeCwgeSwgaiwgY29sLCByb3csIG1hdHJpeDtcblxuXG4gIG1hdHJpeCA9IHRoaXMuX21hdHJpeDtcblxuICB4ID0gcG9zaXRpb24ueDtcbiAgeSA9IHBvc2l0aW9uLnk7XG5cbiAgLy8gdGVzdCBvdXQgb2YgYm91bmRzXG4gIHZhciBvdXRPZkJvdW5kc1ggPSAoeCt3aWR0aCA+IHRoaXMuX25Db2xzKTtcbiAgaWYgKG91dE9mQm91bmRzWCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIHNlZSBpZiBhbGwgdGhlIHBvaW50cyBhcmUgZW1wdHlcbiAgZm9yIChpID0gMDsgaSA8IGhlaWdodDsgaSsrKSB7XG4gICAgcm93ID0gKHkraSk7XG4gICAgaWYgKCFtYXRyaXhbcm93XSkge1xuICAgICAgLy8gcm93IGRvZXNuJ3QgZXhpc3RcbiAgICAgIC8vIG5vIHJvdyB3aWxsIGV4aXN0IGFmdGVyIGVpdGhlclxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIHN0ZXAgdGhyb3VnaCB0aGlzIHJvdydzIGNvbHVtbnNcbiAgICBmb3IgKGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgY29sID0gKHgraik7XG5cbiAgICAgIC8vIHRlc3QgYnVzeVxuICAgICAgaWYgKG1hdHJpeFtyb3ddW2NvbF0gPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBHZXQgZmlyc3QgYXZhaWxhYmxlIHBvc2l0aW9uIGZvciByZWN0YW5nbGVcbiAqXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGhlaWdodFxuICogQHRocm93cyB7RXJyb3J9IGlmIHRoZSBncmlkIGlzIHRvbyBzbWFsbCB0byBmaXQgcmVjdFxuICogQHJldHVybiB7TWFzb25yeUxheW91dFBvaW50fVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5nZXRQb3NpdGlvbkZvclJlY3QgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBwb3NpdGlvbiwgZm91bmQsIGk7XG5cbiAgaSA9IDA7XG4gIGZvdW5kID0gZmFsc2U7XG4gIGlmICh3aWR0aCA+IHRoaXMuX25Db2xzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdMYXlvdXQgbWF0cml4IGlzIHRvbyBzbWFsbCB0byBmaXQgYW55IHJlY3RhbmdsZSB3aWR0aCB3aWR0aCAnICsgd2lkdGgpO1xuICB9XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX2ZpbmROZXh0RnJlZVBvaW50KGkrKyk7XG5cbiAgICBpZiAodGhpcy5fY2hlY2tJZlBvaW50Rml0c1JlY3QocG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpKSB7XG4gICAgICByZXR1cm4gcG9zaXRpb247XG4gICAgfVxuICB9XG4gIHJldHVybiBwb3NpdGlvbjtcbn07XG5cbi8qKlxuICogQWRkIGEgcmVjdGFuZ2xlIHRvIG1hdHJpeFxuICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJuIHtNYXNvbnJ5TGF5b3V0UG9pbnR9XG4gKi9cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLmFkZFJlY3QgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBwb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb25Gb3JSZWN0KHdpZHRoLCBoZWlnaHQpO1xuICB2YXIgeSA9IHBvc2l0aW9uLnk7XG4gIHZhciB4ID0gcG9zaXRpb24ueDtcbiAgdmFyIGk7XG4gIHZhciBqO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgIC8vIGFkZCBuZXcgcm93IGlmIG5lZWRlZFxuICAgIGlmICghdGhpcy5fbWF0cml4W3kraV0pIHtcbiAgICAgIHRoaXMuX2FkZE5ld1JvdygpO1xuICAgIH1cblxuICAgIC8vIGFkZCBibG9jayBvbiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgZm9yIChqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIHRoaXMuX21hdHJpeFt5K2ldW2oreF0gPSAxO1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIHBvc2l0aW9uO1xufTtcblxuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5nZXROdW1iZXJPZlJvd3MgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX21hdHJpeC5sZW5ndGg7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeUxheW91dDtcbiIsInZhciBNYXNvbnJ5TGF5b3V0ID0gcmVxdWlyZSgnLi9saWIvbGF5b3V0Jyk7XG5cblxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICBjb2x1bW5XaWR0aDogMTAwLFxuICByb3dIZWlnaHQ6IDEwMCxcbiAgZ3V0dGVyU2l6ZTogMTAsXG4gIGZpbHRlckNhbGxiYWNrOiBudWxsLFxuICBzb3J0Q2FsbGJhY2s6IG51bGwsXG4gIGhpZGRlbkNsYXNzTmFtZTogJ2hpZGRlbicsXG4gIGhpZGRlblN0eWxlOiB7XG4gICAgc2NhbGU6IDAuMDFcbiAgfSxcbiAgdmlzaWJsZVN0eWxlOiB7XG4gICAgc2NhbGU6IDFcbiAgfVxufTtcblxuZnVuY3Rpb24gZXh0ZW5kKG8xLCBvMikge1xuICBmb3IgKHZhciBrIGluIG8yKSB7XG4gICAgaWYgKG8yLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICBvMVtrXSA9IG8yW2tdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbzE7XG59XG5cblxuLy8gQGxpbmsgaHR0cDovL2Rhdmlkd2Fsc2gubmFtZS92ZW5kb3ItcHJlZml4XG52YXIgcHJlZml4ID0gJ3dlYmtpdCc7XG5cbnZhciB0cmFuc2xhdGUzZCA9IHRydWU7IC8vIEZJWE1FIGNoZWNrIGZvciBzdXBwb3J0XG5cblxudmFyIGhhc0NsYXNzTmFtZSA9IGZ1bmN0aW9uIHRvZ2dsZUNsYXNzTmFtZShlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgdmFyIGhhc0NsYXNzTmFtZVJlZ0V4ID0gbmV3IFJlZ0V4cCgnKD86XnxcXFxccyknICsgY2xhc3NOYW1lICsgJyg/IVxcXFxTKScsICdnJyk7XG5cbiAgcmV0dXJuIGhhc0NsYXNzTmFtZVJlZ0V4LnRlc3QoZWxlbWVudC5jbGFzc05hbWUpO1xufTtcblxuXG52YXIgdG9nZ2xlQ2xhc3NOYW1lID0gZnVuY3Rpb24gdG9nZ2xlQ2xhc3NOYW1lKGVsZW1lbnQsIGNsYXNzTmFtZSwgc2hvdykge1xuICB2YXIgaGFzQ2xhc3NOYW1lUmVnRXggPSBuZXcgUmVnRXhwKCcoPzpefFxcXFxzKScgKyBjbGFzc05hbWUgKyAnKD8hXFxcXFMpJywgJ2cnKTtcbiAgdmFyIGNsYXNzTGlzdCA9IGVsZW1lbnQuY2xhc3NOYW1lO1xuXG4gIHZhciBuZXdDbGFzc0xpc3QgPSBjbGFzc0xpc3Q7XG4gIGlmIChzaG93KSB7XG4gICAgaWYgKGhhc0NsYXNzTmFtZShlbGVtZW50LCBjbGFzc05hbWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5ld0NsYXNzTGlzdCArPSAnICcgKyBjbGFzc05hbWU7XG4gIH0gZWxzZSB7XG4gICAgbmV3Q2xhc3NMaXN0ID0gY2xhc3NMaXN0LnJlcGxhY2UoaGFzQ2xhc3NOYW1lUmVnRXgsICcgJyk7XG4gIH1cbiAgLy8gcmVtb3ZlIGRvdWJsZSBzcGFjZXNcbiAgbmV3Q2xhc3NMaXN0ID0gbmV3Q2xhc3NMaXN0LnJlcGxhY2UoL1xccysvZywgJyAnKTtcblxuICAvLyB0cmltIHdoaXRlc3BhY2VcbiAgbmV3Q2xhc3NMaXN0ID0gbmV3Q2xhc3NMaXN0LnJlcGxhY2UoLyheXFxzK3xcXHMrJCkvZywgJycpO1xuXG4gIGVsZW1lbnQuY2xhc3NOYW1lID0gbmV3Q2xhc3NMaXN0O1xufTtcblxuZnVuY3Rpb24gTWFzb25yeShlbGVtZW50SUQsIG9wdHMpIHtcbiAgdGhpcy5fdmlld3BvcnRJRCA9IGVsZW1lbnRJRDtcbiAgdGhpcy5fdmlld3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50SUQpO1xuXG4gIHRoaXMuX29wdGlvbnMgPSB7fTtcbiAgdGhpcy5fb3B0aW9ucyA9IGV4dGVuZCh0aGlzLl9vcHRpb25zLCBkZWZhdWx0T3B0aW9ucyk7XG4gIHRoaXMuX29wdGlvbnMgPSBleHRlbmQodGhpcy5fb3B0aW9ucywgb3B0cyk7XG5cbiAgdGhpcy5fZmlsdGVyZWRJdGVtcyA9IFtdO1xuICB0aGlzLl9oaWRkZW5JdGVtcyA9IFtdO1xuXG4gIHRoaXMucmVMYXlvdXQoKTtcbn1cblxuXG5cbk1hc29ucnkucHJvdG90eXBlLl9maWx0ZXJJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9maWx0ZXJlZEl0ZW1zID0gW107XG4gIHRoaXMuX2hpZGRlbkl0ZW1zID0gW107XG5cbiAgdmFyIGxlbiA9IHRoaXMuX2l0ZW1zLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciAkaXRlbSA9IHRoaXMuX2l0ZW1zW2ldO1xuXG4gICAgdmFyIHNob3cgPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuZmlsdGVyQ2FsbGJhY2spIHtcbiAgICAgIHNob3cgPSB0aGlzLl9vcHRpb25zLmZpbHRlckNhbGxiYWNrKCRpdGVtKTtcbiAgICB9XG5cbiAgICBpZiAoc2hvdykge1xuICAgICAgdGhpcy5fZmlsdGVyZWRJdGVtcy5wdXNoKCRpdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGlkZGVuSXRlbXMucHVzaCgkaXRlbSk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIHRoZSBDU1MgJiBzdHlsZXNcbiAgICB0b2dnbGVDbGFzc05hbWUoJGl0ZW0sIHRoaXMuX29wdGlvbnMuaGlkZGVuQ2xhc3NOYW1lLCAhc2hvdyk7XG5cbiAgICB2YXIgc3R5bGVzID0gc2hvdyA/IHRoaXMuX29wdGlvbnMudmlzaWJsZVN0eWxlIDogdGhpcy5fb3B0aW9ucy5oaWRkZW5TdHlsZTtcbiAgICAkaXRlbS5fc3R5bGVzID0gJGl0ZW0uX3N0eWxlcyB8fCB7fTtcbiAgICAkaXRlbS5fc3R5bGVzID0gZXh0ZW5kKCRpdGVtLl9zdHlsZXMsIHN0eWxlcyk7XG4gIH1cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuX3NvcnRJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc29ydENhbGxiYWNrID0gdGhpcy5fb3B0aW9ucy5zb3J0Q2FsbGJhY2s7XG4gIGlmIChzb3J0Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9maWx0ZXJlZEl0ZW1zLnNvcnQoc29ydENhbGxiYWNrKTtcblxuICAgIHZhciBsZW4gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgJGl0ZW0gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zW2ldO1xuXG4gICAgICB0aGlzLl92aWV3cG9ydC5hcHBlbmRDaGlsZCgkaXRlbSk7XG4gICAgfVxuXG4gIH1cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuX3Bvc2l0aW9uSXRlbVRvUG9pbnQgPSBmdW5jdGlvbigkaXRlbSwgcG9pbnQpIHtcbiAgdmFyIHggPSBwb2ludC54ICogdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aDtcbiAgdmFyIHkgPSBwb2ludC55ICogdGhpcy5fb3B0aW9ucy5yb3dIZWlnaHQ7XG5cbiAgeCArPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplICogcG9pbnQueCk7XG4gIHkgKz0gKHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSAqIHBvaW50LnkpO1xuXG4gICRpdGVtLl9zdHlsZXMgPSAkaXRlbS5fc3R5bGVzIHx8IHt9O1xuICAkaXRlbS5fc3R5bGVzID0gZXh0ZW5kKCRpdGVtLl9zdHlsZXMsIHtcbiAgICB4OiB4ICsgJ3B4JyxcbiAgICB5OiB5ICsgJ3B4J1xuICB9KTtcbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9nZXRJdGVtTGF5b3V0U3BhbiA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIC8vIFRPRE9cbiAgLy8gbW92ZSBndXR0ZXIgbWF0aCBpbnRvIE1hc29ucnlMYXlvdXQgY29tcG9uZW50L3N1YmNsYXNzP1xuICAvLyBtYWtlIE1hc29ucnlMYXlvdXRTcGFuIGZvciB0aGlzIG9iamVjdD9cbiAgLy8gaG93IG1hbnkgY29sL3Jvd3MgZG9lcyB0aGlzIGl0ZW0gb2NjdXB5XG4gIC8vIG1lbW9pemUgcmVzdWx0cz9cbiAgdmFyIGl0ZW1Db2xTcGFuID0gJGl0ZW0ub2Zmc2V0V2lkdGggIC8gdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aDtcbiAgdmFyIGl0ZW1Sb3dTcGFuID0gJGl0ZW0ub2Zmc2V0SGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5yb3dIZWlnaHQ7XG5cbiAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgZ3V0dGVyIGluIHRoZSBjYWxjdWxhdGlvblxuICBpdGVtQ29sU3BhbiAtPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplL3RoaXMuX29wdGlvbnMuY29sdW1uV2lkdGgpICogTWF0aC5mbG9vcihpdGVtQ29sU3BhbiAtIDEpO1xuICBpdGVtUm93U3BhbiAtPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplL3RoaXMuX29wdGlvbnMucm93SGVpZ2h0KSAqIE1hdGguZmxvb3IoaXRlbVJvd1NwYW4gLSAxKTtcblxuICAvLyByb3VuZCB1cFxuICBpdGVtQ29sU3BhbiA9IE1hdGguY2VpbChpdGVtQ29sU3Bhbik7XG4gIGl0ZW1Sb3dTcGFuID0gTWF0aC5jZWlsKGl0ZW1Sb3dTcGFuKTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBpdGVtQ29sU3BhbixcbiAgICBoZWlnaHQ6IGl0ZW1Sb3dTcGFuXG4gIH07XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcG9zaXRpb25JdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuID0gdGhpcy5fZmlsdGVyZWRJdGVtcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgJGl0ZW0gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zW2ldO1xuXG4gICAgdmFyIHNwYW4gPSB0aGlzLl9nZXRJdGVtTGF5b3V0U3BhbigkaXRlbSk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5sYXlvdXQuYWRkUmVjdChzcGFuLndpZHRoLCBzcGFuLmhlaWdodCk7XG5cbiAgICB0aGlzLl9wb3NpdGlvbkl0ZW1Ub1BvaW50KCRpdGVtLCBwb3NpdGlvbik7XG4gIH1cbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9jYWxjdWxhdGVOdW1iZXJPZkNvbHVtbnMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgdmlld1BvcnRFeHRyYUd1dHRlciA9ICh0aGlzLl92aWV3cG9ydC5vZmZzZXRXaWR0aCArIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSk7XG4gIHZhciBjb2x1bW5XaWR0aFdpdGhHdXR0ZXIgPSAodGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aCArIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSk7XG5cbiAgdmFyIG5Db2xzID0gdmlld1BvcnRFeHRyYUd1dHRlciAvIGNvbHVtbldpZHRoV2l0aEd1dHRlcjtcblxuXG4gIHRoaXMuX251bWJlck9mQ29sdW1ucyA9IE1hdGguZmxvb3IobkNvbHMpO1xufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3Jlc2l6ZVZpZXdQb3J0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBudW1iZXJPZlJvd3MgPSB0aGlzLmxheW91dC5nZXROdW1iZXJPZlJvd3MoKTtcblxuICAvLyBhdXRvLWFkanVzdHMgb24gd2lkdGhcbiAgLy8gdmFyIHdpZHRoID0gKHRoaXMuX251bWJlck9mQ29sdW1ucyAqIHRoaXMuX29wdGlvbnMuY29sdW1uV2lkdGgpICsgKHRoaXMuX251bWJlck9mQ29sdW1ucy0xKSAqIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZTtcbiAgdmFyIGhlaWdodCA9IChudW1iZXJPZlJvd3MgKiB0aGlzLl9vcHRpb25zLnJvd0hlaWdodCkgKyAobnVtYmVyT2ZSb3dzLTEpICogdGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplO1xuXG4gIHRoaXMuX3ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcmVzZXRJdGVtVHJhbnNmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuID0gdGhpcy5faXRlbXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyICRpdGVtID0gdGhpcy5faXRlbXNbaV07XG5cbiAgICAvLyBGSVhNRSBkb24ndCBlZGl0IHRoZSBET00gb2JqZWN0LCBoYXZlIGFuIGludGVybmFsIGhhc2htYXAgaW5zdGVhZFxuICAgICRpdGVtLl9zdHlsZXMgPSB7fTtcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3ByZXBhcmVJdGVtID0gZnVuY3Rpb24oJGl0ZW0pIHtcbiAgLy8gVE9ETyBiZXR0ZXIgY2hlY2tcbiAgdmFyIGlzRmlyc3RUaW1lID0gKCRpdGVtLnN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnKTtcbiAgaWYgKGlzRmlyc3RUaW1lKSB7XG4gICAgJGl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGFuaW1hdGUgaW4gb24gcmVuZGVyXG4gICAgLy8gVE9ETyBzaG91bGQgcHJvYmFibHkgYmUgcmUtd3JpdHRlbiBvbmNlIHdlIGdldCBpbnRvIGFkZGluZ1xuICAgICRpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdmFyIHJlcGFpbnQgPSAkaXRlbS5vZmZzZXRIZWlnaHQ7XG4gICAgJGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9wZXJmb3JtSXRlbVRyYW5zZm9ybXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxlbiA9IHRoaXMuX2l0ZW1zLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciAkaXRlbSA9IHRoaXMuX2l0ZW1zW2ldO1xuICAgIHRoaXMuX3ByZXBhcmVJdGVtKCRpdGVtKTtcblxuICAgIHZhciB4ID0gJGl0ZW0uX3N0eWxlcy54O1xuICAgIHZhciB5ID0gJGl0ZW0uX3N0eWxlcy55O1xuICAgIHZhciBzY2FsZSA9ICRpdGVtLl9zdHlsZXMuc2NhbGUgfHwgMTtcblxuICAgIGlmICh0cmFuc2xhdGUzZCkge1xuICAgICAgdmFyIHRyYW5zZm9ybVN0ciA9ICcnO1xuICAgICAgdHJhbnNmb3JtU3RyICs9ICd0cmFuc2xhdGUzZCgnK3grJywnK3krJywwKSAnO1xuICAgICAgdHJhbnNmb3JtU3RyICs9ICdzY2FsZTNkKCcrc2NhbGUrJywgJytzY2FsZSsnLCAxKSc7XG5cbiAgICAgICRpdGVtLnN0eWxlW3ByZWZpeCArICdUcmFuc2Zvcm0nXSA9IHRyYW5zZm9ybVN0cjtcblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBwdWJsaWNcbiAqIEByZXR1cm4gTWFzb25yeVxuICovXG5NYXNvbnJ5LnByb3RvdHlwZS5yZUxheW91dCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9pdGVtcyA9IFtdLnNsaWNlLmNhbGwodGhpcy5fdmlld3BvcnQuY2hpbGRyZW4pO1xuXG4gIHRoaXMuX2ZpbHRlckl0ZW1zKCk7XG4gIHRoaXMuX3NvcnRJdGVtcygpO1xuXG4gIHRoaXMuX2NhbGN1bGF0ZU51bWJlck9mQ29sdW1ucygpO1xuXG4gIHRoaXMubGF5b3V0ID0gbmV3IE1hc29ucnlMYXlvdXQodGhpcy5fbnVtYmVyT2ZDb2x1bW5zKTtcblxuICB0aGlzLl9wb3NpdGlvbkl0ZW1zKCk7XG5cbiAgdGhpcy5fcGVyZm9ybUl0ZW1UcmFuc2Zvcm1zKCk7XG5cbiAgdGhpcy5fcmVzaXplVmlld1BvcnQoKTtcblxuICAvLyBUT0RPXG4gIC8vIHNvbWUga2luZCBvZiB0cmlnZ2VyIHdoZW4gcmVMYXlvdXQgaXMgZG9uZT9cbiAgLy8gY291bGQgYmUgdXNlZCB0byBjbGVhbiB1cCB1bi11c2VkIGl0ZW1zIGZyb20gdGhlIERPTSB0cmVlIGV0Y1xuICAvL1xuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTsiXX0=
(3)
});
