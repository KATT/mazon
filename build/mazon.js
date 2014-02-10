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

function repaint(element) {
  var repaint = element.offsetHeight;
}



var prefix = 'webkit';
var transitionEnd = 'webkitTransitionEnd';
var translate3d = true; // FIXME check for support


var hasClassName = function toggleClassName(element, className) {
  var hasClassNameRegEx = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');

  return hasClassNameRegEx.test(element.className);
};


var toggleClassName = function toggleClassName(element, className, add) {
  var hasClassNameRegEx = new RegExp('(?:^|\\s)' + className + '(?!\\S)', 'g');
  var classList = element.className;

  var hasClass = hasClassName(element, className);

  var newClassList = classList;
  if ((add && hasClass) || (!add && !hasClass)) {
    // no change
    return;
  }
  if (add) {
    // add className
    newClassList += ' ' + className;
  } else {
    // remove className
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

  this._setup();
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

      // this._viewport.appendChild($item);
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

Masonry.prototype._calculateViewPortHeight = function() {
  var numberOfRows = this.layout.getNumberOfRows();

  // auto-adjusts on width
  // var width = (this._numberOfColumns * this._options.columnWidth) + (this._numberOfColumns-1) * this._options.gutterSize;
  var height = (numberOfRows * this._options.rowHeight) + (numberOfRows/*-1*/) * this._options.gutterSize;

  return height;
};

Masonry.prototype._expandViewPort = function() {
  var currentHeight = this._viewport.style.height || 0;
  currentHeight = parseInt(currentHeight, 10);

  if (currentHeight < this._calculateViewPortHeight()) {
    this._resizeViewPort();
  }
};
Masonry.prototype._resizeViewPort = function() {
  var numberOfRows = this.layout.getNumberOfRows();
  var height = this._calculateViewPortHeight();

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

Masonry.prototype._setHiddenStyle = function($item) {
  var scale = this._options.hiddenStyle.scale || 1;
  toggleClassName($item, this._options.hiddenClassName, true);

  var transformStr = '';
  // transformStr += 'translate3d('+x+','+y+',0) ';
  transformStr += 'scale3d('+scale+', '+scale+', 1)';

  $item.style[prefix + 'Transform'] = transformStr;
};

Masonry.prototype._setupItem = function($item) {
  // TODO better check
  var isFirstTime = ($item.style.position !== 'absolute');
  if (isFirstTime) {
    // make sure we don't animate in on render
    $item.style.display = 'none';
    repaint($item);
    // this._setHiddenStyle($item);

    $item.style.position = 'absolute';

    // TODO should probably be re-written once we get into adding

    var x = $item._styles.x;
    var y = $item._styles.y;
    var scale = this._options.hiddenStyle.scale || 1;

    var transformStr = '';
    transformStr += 'translate3d('+x+','+y+',0) ';
    transformStr += 'scale3d('+scale+', '+scale+', 1)';

    $item.style[prefix + 'Transform'] = transformStr;

    $item.style.display = 'block';
    repaint($item.offsetHeight);
  }
};

Masonry.prototype._performItemTransforms = function() {
  var len = this._items.length;
  for (var i = 0; i < len; i++) {
    var $item = this._items[i];

    // TODO
    // if item was hidden, "teleport" (no transition) it to correct x,y
    // then scale 0 -> 1

    var x = $item._styles.x;
    var y = $item._styles.y;
    var scale = $item._styles.scale || 1;


    this._setupItem($item);

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

Masonry.prototype._setup = function() {
  var self = this;
  // TODO not cross-browser
  self._viewport.addEventListener(transitionEnd, function() {
    self._onTransitionEnd();
  });

  toggleClassName(self._viewport, 'no-transition', true);

  repaint(self._viewport);
  self.reLayout();

  repaint(self._viewport);
  toggleClassName(self._viewport, 'no-transition', false);

};

Masonry.prototype._onTransitionEnd = function () {
  this._resizeViewPort();
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

  this._expandViewPort();

  // TODO
  // some kind of trigger when reLayout is done?
  // could be used to clean up un-used items from the DOM tree etc
  //
  return this;
};


Masonry.prototype.addItem = function($item) {
  // prepend so it has the lowest z-index
  if (this._viewport.firstChild) {
    this._viewport.insertBefore($item, this._viewport.firstChild);
  } else {
    this._viewport.appendChild($item);
  }

  return this;
};

module.exports = Masonry;
},{"./lib/layout":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL2xpYi9sYXlvdXQtcG9pbnQuanMiLCIvVXNlcnMvYWpheC9kZXYvbWF6b24vbGliL2xheW91dC5qcyIsIi9Vc2Vycy9hamF4L2Rldi9tYXpvbi9tYXpvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbmZ1bmN0aW9uIE1hc29ucnlMYXlvdXRQb2ludCh4LCB5KSB7XG4gIHRoaXMueCA9IE51bWJlcih4KTtcbiAgdGhpcy55ID0gTnVtYmVyKHkpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeUxheW91dFBvaW50OyIsInZhciBNYXNvbnJ5TGF5b3V0UG9pbnQgPSByZXF1aXJlKCcuL2xheW91dC1wb2ludCcpO1xuXG4vKipcbiAqIE1hc29ucnlMYXlvdXQsIGhlbHBzIHdoZXJlIHRvIHB1dCByZWN0YW5nbGVzIGluIGFuIFgqWSBncmlkLFxuICogYXV0b21hdGljYWxseSBleHRlbmRpbmcgdmVydGljYWxseVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBOdW1iZXIgb2YgY29sdW1ucyB0aGF0IHRoaXMgbGF5b3V0IGNvbnRhaW5zXG4gKi9cbmZ1bmN0aW9uIE1hc29ucnlMYXlvdXQoX25Db2xzLCBtYXRyaXgpIHtcbiAgdGhpcy5fbkNvbHMgPSBfbkNvbHM7XG4gIHRoaXMuX21hdHJpeCA9IG1hdHJpeCB8fCBbXTtcbn1cblxuXG5cbi8qKlxuICogRmluZHMgbmV4dCBmcmVlIHBvaW50IGluIG1hdHJpeFxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gTnVtYmVyIG9mIHBvaW50cyB0byBpZ25vcmVcbiAqIEByZXR1cm4ge01hc29ucnlMYXlvdXRQb2ludH1cbiAqL1xuTWFzb25yeUxheW91dC5wcm90b3R5cGUuX2ZpbmROZXh0RnJlZVBvaW50ID0gZnVuY3Rpb24oc2tpcCkge1xuICB2YXIgY29scywgaSwgaXNUYWtlbiwgeCwgeSwgX21hdHJpeDtcbiAgaWYgKCFza2lwKSB7XG4gICAgc2tpcCA9IDA7XG4gIH1cblxuICBpID0gMDtcbiAgX21hdHJpeCA9IHRoaXMuX21hdHJpeDtcblxuICAvLyBTdGVwIHRocm91Z2ggcm93cyBpbiBtYXRyaXhcbiAgZm9yICh5ID0gMDsgeSA8IF9tYXRyaXgubGVuZ3RoOyB5KyspIHtcbiAgICBjb2xzID0gX21hdHJpeFt5XTtcbiAgICAvLyBTdGVwIHRocm91Z2ggY29sc1xuICAgIGZvciAoeCA9IDA7IHggPCBjb2xzLmxlbmd0aDsgeCsrKSB7XG4gICAgICAvLyBJcyB0aGlzIHNwYWNlIGZyZWU/XG4gICAgICBpc1Rha2VuID0gY29sc1t4XTtcbiAgICAgIGlmICghaXNUYWtlbikge1xuICAgICAgICBpZiAoc2tpcCA8PSBpKyspIHtcbiAgICAgICAgICByZXR1cm4gbmV3IE1hc29ucnlMYXlvdXRQb2ludCh4LCB5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHdlIGRpZG4ndCBmaW5kIGFueSBmcmVlIHNwYWNlIGluIHRoZSB3aG9sZSBNYXRyaXghXG4gIC8vIHJldHVybiBmaXJzdCBwb3NpdGlvbiBvZiBuZXh0IGxpbmVcbiAgcmV0dXJuIG5ldyBNYXNvbnJ5TGF5b3V0UG9pbnQoMCwgX21hdHJpeC5sZW5ndGgpO1xufTtcblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuX2FkZE5ld1JvdyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgeSA9IHRoaXMuX21hdHJpeC5sZW5ndGg7XG5cbiAgdGhpcy5fbWF0cml4W3ldID0gW107XG4gIGZvciAodmFyIGk9MDsgaSA8IHRoaXMuX25Db2xzOyBpKyspIHtcbiAgICB0aGlzLl9tYXRyaXhbeV1baV0gPSAwO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwb2ludCBpbiB0aGUgbWF0cml4IGZpdHMgdG8gaG9sZCBhIHJlY3RhbmdsZSB3aXRoIHNpemVcbiAqXG4gKiBAcGFyYW0gIHtNYXNvbnJ5TGF5b3V0UG9pbnR9IHBvc2l0aW9uXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IHdpZHRoXG4gKiBAcGFyYW0gIHtOdW1iZXJ9IGhlaWdodFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuTWFzb25yeUxheW91dC5wcm90b3R5cGUuX2NoZWNrSWZQb2ludEZpdHNSZWN0ID0gZnVuY3Rpb24ocG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGR4LCBpLCB4LCB5LCBqLCBjb2wsIHJvdywgbWF0cml4O1xuXG5cbiAgbWF0cml4ID0gdGhpcy5fbWF0cml4O1xuXG4gIHggPSBwb3NpdGlvbi54O1xuICB5ID0gcG9zaXRpb24ueTtcblxuICAvLyB0ZXN0IG91dCBvZiBib3VuZHNcbiAgdmFyIG91dE9mQm91bmRzWCA9ICh4K3dpZHRoID4gdGhpcy5fbkNvbHMpO1xuICBpZiAob3V0T2ZCb3VuZHNYKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gc2VlIGlmIGFsbCB0aGUgcG9pbnRzIGFyZSBlbXB0eVxuICBmb3IgKGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICByb3cgPSAoeStpKTtcbiAgICBpZiAoIW1hdHJpeFtyb3ddKSB7XG4gICAgICAvLyByb3cgZG9lc24ndCBleGlzdFxuICAgICAgLy8gbm8gcm93IHdpbGwgZXhpc3QgYWZ0ZXIgZWl0aGVyXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gc3RlcCB0aHJvdWdoIHRoaXMgcm93J3MgY29sdW1uc1xuICAgIGZvciAoaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICBjb2wgPSAoeCtqKTtcblxuICAgICAgLy8gdGVzdCBidXN5XG4gICAgICBpZiAobWF0cml4W3Jvd11bY29sXSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEdldCBmaXJzdCBhdmFpbGFibGUgcG9zaXRpb24gZm9yIHJlY3RhbmdsZVxuICpcbiAqIEBwYXJhbSAge051bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSAge051bWJlcn0gaGVpZ2h0XG4gKiBAdGhyb3dzIHtFcnJvcn0gaWYgdGhlIGdyaWQgaXMgdG9vIHNtYWxsIHRvIGZpdCByZWN0XG4gKiBAcmV0dXJuIHtNYXNvbnJ5TGF5b3V0UG9pbnR9XG4gKi9cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLmdldFBvc2l0aW9uRm9yUmVjdCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIHBvc2l0aW9uLCBmb3VuZCwgaTtcblxuICBpID0gMDtcbiAgZm91bmQgPSBmYWxzZTtcbiAgaWYgKHdpZHRoID4gdGhpcy5fbkNvbHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheW91dCBtYXRyaXggaXMgdG9vIHNtYWxsIHRvIGZpdCBhbnkgcmVjdGFuZ2xlIHdpZHRoIHdpZHRoICcgKyB3aWR0aCk7XG4gIH1cblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHBvc2l0aW9uID0gdGhpcy5fZmluZE5leHRGcmVlUG9pbnQoaSsrKTtcblxuICAgIGlmICh0aGlzLl9jaGVja0lmUG9pbnRGaXRzUmVjdChwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCkpIHtcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBvc2l0aW9uO1xufTtcblxuLyoqXG4gKiBBZGQgYSByZWN0YW5nbGUgdG8gbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAqIEByZXR1cm4ge01hc29ucnlMYXlvdXRQb2ludH1cbiAqL1xuTWFzb25yeUxheW91dC5wcm90b3R5cGUuYWRkUmVjdCA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkZvclJlY3Qod2lkdGgsIGhlaWdodCk7XG4gIHZhciB5ID0gcG9zaXRpb24ueTtcbiAgdmFyIHggPSBwb3NpdGlvbi54O1xuICB2YXIgaTtcbiAgdmFyIGo7XG5cbiAgZm9yIChpID0gMDsgaSA8IGhlaWdodDsgaSsrKSB7XG4gICAgLy8gYWRkIG5ldyByb3cgaWYgbmVlZGVkXG4gICAgaWYgKCF0aGlzLl9tYXRyaXhbeStpXSkge1xuICAgICAgdGhpcy5fYWRkTmV3Um93KCk7XG4gICAgfVxuXG4gICAgLy8gYWRkIGJsb2NrIG9uIHdpZHRoIGFuZCBoZWlnaHRcbiAgICBmb3IgKGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgdGhpcy5fbWF0cml4W3kraV1bait4XSA9IDE7XG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gcG9zaXRpb247XG59O1xuXG5cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLmdldE51bWJlck9mUm93cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fbWF0cml4Lmxlbmd0aDtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5TGF5b3V0O1xuIiwidmFyIE1hc29ucnlMYXlvdXQgPSByZXF1aXJlKCcuL2xpYi9sYXlvdXQnKTtcblxuXG52YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gIGNvbHVtbldpZHRoOiAxMDAsXG4gIHJvd0hlaWdodDogMTAwLFxuICBndXR0ZXJTaXplOiAxMCxcbiAgZmlsdGVyQ2FsbGJhY2s6IG51bGwsXG4gIHNvcnRDYWxsYmFjazogbnVsbCxcbiAgaGlkZGVuQ2xhc3NOYW1lOiAnaGlkZGVuJyxcbiAgaGlkZGVuU3R5bGU6IHtcbiAgICBzY2FsZTogMC4wMVxuICB9LFxuICB2aXNpYmxlU3R5bGU6IHtcbiAgICBzY2FsZTogMVxuICB9XG59O1xuXG5mdW5jdGlvbiBleHRlbmQobzEsIG8yKSB7XG4gIGZvciAodmFyIGsgaW4gbzIpIHtcbiAgICBpZiAobzIuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgIG8xW2tdID0gbzJba107XG4gICAgfVxuICB9XG4gIHJldHVybiBvMTtcbn1cblxuZnVuY3Rpb24gcmVwYWludChlbGVtZW50KSB7XG4gIHZhciByZXBhaW50ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG59XG5cblxuXG52YXIgcHJlZml4ID0gJ3dlYmtpdCc7XG52YXIgdHJhbnNpdGlvbkVuZCA9ICd3ZWJraXRUcmFuc2l0aW9uRW5kJztcbnZhciB0cmFuc2xhdGUzZCA9IHRydWU7IC8vIEZJWE1FIGNoZWNrIGZvciBzdXBwb3J0XG5cblxudmFyIGhhc0NsYXNzTmFtZSA9IGZ1bmN0aW9uIHRvZ2dsZUNsYXNzTmFtZShlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgdmFyIGhhc0NsYXNzTmFtZVJlZ0V4ID0gbmV3IFJlZ0V4cCgnKD86XnxcXFxccyknICsgY2xhc3NOYW1lICsgJyg/IVxcXFxTKScsICdnJyk7XG5cbiAgcmV0dXJuIGhhc0NsYXNzTmFtZVJlZ0V4LnRlc3QoZWxlbWVudC5jbGFzc05hbWUpO1xufTtcblxuXG52YXIgdG9nZ2xlQ2xhc3NOYW1lID0gZnVuY3Rpb24gdG9nZ2xlQ2xhc3NOYW1lKGVsZW1lbnQsIGNsYXNzTmFtZSwgYWRkKSB7XG4gIHZhciBoYXNDbGFzc05hbWVSZWdFeCA9IG5ldyBSZWdFeHAoJyg/Ol58XFxcXHMpJyArIGNsYXNzTmFtZSArICcoPyFcXFxcUyknLCAnZycpO1xuICB2YXIgY2xhc3NMaXN0ID0gZWxlbWVudC5jbGFzc05hbWU7XG5cbiAgdmFyIGhhc0NsYXNzID0gaGFzQ2xhc3NOYW1lKGVsZW1lbnQsIGNsYXNzTmFtZSk7XG5cbiAgdmFyIG5ld0NsYXNzTGlzdCA9IGNsYXNzTGlzdDtcbiAgaWYgKChhZGQgJiYgaGFzQ2xhc3MpIHx8ICghYWRkICYmICFoYXNDbGFzcykpIHtcbiAgICAvLyBubyBjaGFuZ2VcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGFkZCkge1xuICAgIC8vIGFkZCBjbGFzc05hbWVcbiAgICBuZXdDbGFzc0xpc3QgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9IGVsc2Uge1xuICAgIC8vIHJlbW92ZSBjbGFzc05hbWVcbiAgICBuZXdDbGFzc0xpc3QgPSBjbGFzc0xpc3QucmVwbGFjZShoYXNDbGFzc05hbWVSZWdFeCwgJyAnKTtcbiAgfVxuICAvLyByZW1vdmUgZG91YmxlIHNwYWNlc1xuICBuZXdDbGFzc0xpc3QgPSBuZXdDbGFzc0xpc3QucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuXG4gIC8vIHRyaW0gd2hpdGVzcGFjZVxuICBuZXdDbGFzc0xpc3QgPSBuZXdDbGFzc0xpc3QucmVwbGFjZSgvKF5cXHMrfFxccyskKS9nLCAnJyk7XG5cbiAgZWxlbWVudC5jbGFzc05hbWUgPSBuZXdDbGFzc0xpc3Q7XG59O1xuXG5mdW5jdGlvbiBNYXNvbnJ5KGVsZW1lbnRJRCwgb3B0cykge1xuICB0aGlzLl92aWV3cG9ydElEID0gZWxlbWVudElEO1xuICB0aGlzLl92aWV3cG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJRCk7XG5cbiAgdGhpcy5fb3B0aW9ucyA9IHt9O1xuICB0aGlzLl9vcHRpb25zID0gZXh0ZW5kKHRoaXMuX29wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbiAgdGhpcy5fb3B0aW9ucyA9IGV4dGVuZCh0aGlzLl9vcHRpb25zLCBvcHRzKTtcblxuICB0aGlzLl9maWx0ZXJlZEl0ZW1zID0gW107XG4gIHRoaXMuX2hpZGRlbkl0ZW1zID0gW107XG5cbiAgdGhpcy5fc2V0dXAoKTtcbn1cblxuXG5cbk1hc29ucnkucHJvdG90eXBlLl9maWx0ZXJJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9maWx0ZXJlZEl0ZW1zID0gW107XG4gIHRoaXMuX2hpZGRlbkl0ZW1zID0gW107XG5cbiAgdmFyIGxlbiA9IHRoaXMuX2l0ZW1zLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciAkaXRlbSA9IHRoaXMuX2l0ZW1zW2ldO1xuXG4gICAgdmFyIHNob3cgPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMuX29wdGlvbnMuZmlsdGVyQ2FsbGJhY2spIHtcbiAgICAgIHNob3cgPSB0aGlzLl9vcHRpb25zLmZpbHRlckNhbGxiYWNrKCRpdGVtKTtcbiAgICB9XG5cbiAgICBpZiAoc2hvdykge1xuICAgICAgdGhpcy5fZmlsdGVyZWRJdGVtcy5wdXNoKCRpdGVtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGlkZGVuSXRlbXMucHVzaCgkaXRlbSk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIHRoZSBDU1MgJiBzdHlsZXNcbiAgICB0b2dnbGVDbGFzc05hbWUoJGl0ZW0sIHRoaXMuX29wdGlvbnMuaGlkZGVuQ2xhc3NOYW1lLCAhc2hvdyk7XG5cbiAgICB2YXIgc3R5bGVzID0gc2hvdyA/IHRoaXMuX29wdGlvbnMudmlzaWJsZVN0eWxlIDogdGhpcy5fb3B0aW9ucy5oaWRkZW5TdHlsZTtcbiAgICAkaXRlbS5fc3R5bGVzID0gJGl0ZW0uX3N0eWxlcyB8fCB7fTtcbiAgICAkaXRlbS5fc3R5bGVzID0gZXh0ZW5kKCRpdGVtLl9zdHlsZXMsIHN0eWxlcyk7XG4gIH1cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuX3NvcnRJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc29ydENhbGxiYWNrID0gdGhpcy5fb3B0aW9ucy5zb3J0Q2FsbGJhY2s7XG4gIGlmIChzb3J0Q2FsbGJhY2spIHtcbiAgICB0aGlzLl9maWx0ZXJlZEl0ZW1zLnNvcnQoc29ydENhbGxiYWNrKTtcblxuICAgIHZhciBsZW4gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgJGl0ZW0gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zW2ldO1xuXG4gICAgICAvLyB0aGlzLl92aWV3cG9ydC5hcHBlbmRDaGlsZCgkaXRlbSk7XG4gICAgfVxuXG4gIH1cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuX3Bvc2l0aW9uSXRlbVRvUG9pbnQgPSBmdW5jdGlvbigkaXRlbSwgcG9pbnQpIHtcbiAgdmFyIHggPSBwb2ludC54ICogdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aDtcbiAgdmFyIHkgPSBwb2ludC55ICogdGhpcy5fb3B0aW9ucy5yb3dIZWlnaHQ7XG5cbiAgeCArPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplICogcG9pbnQueCk7XG4gIHkgKz0gKHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSAqIHBvaW50LnkpO1xuXG4gICRpdGVtLl9zdHlsZXMgPSAkaXRlbS5fc3R5bGVzIHx8IHt9O1xuICAkaXRlbS5fc3R5bGVzID0gZXh0ZW5kKCRpdGVtLl9zdHlsZXMsIHtcbiAgICB4OiB4ICsgJ3B4JyxcbiAgICB5OiB5ICsgJ3B4J1xuICB9KTtcbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9nZXRJdGVtTGF5b3V0U3BhbiA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIC8vIFRPRE9cbiAgLy8gbW92ZSBndXR0ZXIgbWF0aCBpbnRvIE1hc29ucnlMYXlvdXQgY29tcG9uZW50L3N1YmNsYXNzP1xuICAvLyBtYWtlIE1hc29ucnlMYXlvdXRTcGFuIGZvciB0aGlzIG9iamVjdD9cbiAgLy8gaG93IG1hbnkgY29sL3Jvd3MgZG9lcyB0aGlzIGl0ZW0gb2NjdXB5XG4gIC8vIG1lbW9pemUgcmVzdWx0cz9cbiAgdmFyIGl0ZW1Db2xTcGFuID0gJGl0ZW0ub2Zmc2V0V2lkdGggIC8gdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aDtcbiAgdmFyIGl0ZW1Sb3dTcGFuID0gJGl0ZW0ub2Zmc2V0SGVpZ2h0IC8gdGhpcy5fb3B0aW9ucy5yb3dIZWlnaHQ7XG5cbiAgLy8gZG9uJ3QgaW5jbHVkZSB0aGUgZ3V0dGVyIGluIHRoZSBjYWxjdWxhdGlvblxuICBpdGVtQ29sU3BhbiAtPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplL3RoaXMuX29wdGlvbnMuY29sdW1uV2lkdGgpICogTWF0aC5mbG9vcihpdGVtQ29sU3BhbiAtIDEpO1xuICBpdGVtUm93U3BhbiAtPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplL3RoaXMuX29wdGlvbnMucm93SGVpZ2h0KSAqIE1hdGguZmxvb3IoaXRlbVJvd1NwYW4gLSAxKTtcblxuICAvLyByb3VuZCB1cFxuICBpdGVtQ29sU3BhbiA9IE1hdGguY2VpbChpdGVtQ29sU3Bhbik7XG4gIGl0ZW1Sb3dTcGFuID0gTWF0aC5jZWlsKGl0ZW1Sb3dTcGFuKTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBpdGVtQ29sU3BhbixcbiAgICBoZWlnaHQ6IGl0ZW1Sb3dTcGFuXG4gIH07XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcG9zaXRpb25JdGVtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuID0gdGhpcy5fZmlsdGVyZWRJdGVtcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgJGl0ZW0gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zW2ldO1xuXG4gICAgdmFyIHNwYW4gPSB0aGlzLl9nZXRJdGVtTGF5b3V0U3BhbigkaXRlbSk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5sYXlvdXQuYWRkUmVjdChzcGFuLndpZHRoLCBzcGFuLmhlaWdodCk7XG5cbiAgICB0aGlzLl9wb3NpdGlvbkl0ZW1Ub1BvaW50KCRpdGVtLCBwb3NpdGlvbik7XG4gIH1cbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9jYWxjdWxhdGVOdW1iZXJPZkNvbHVtbnMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgdmlld1BvcnRFeHRyYUd1dHRlciA9ICh0aGlzLl92aWV3cG9ydC5vZmZzZXRXaWR0aCArIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSk7XG4gIHZhciBjb2x1bW5XaWR0aFdpdGhHdXR0ZXIgPSAodGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aCArIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZSk7XG5cbiAgdmFyIG5Db2xzID0gdmlld1BvcnRFeHRyYUd1dHRlciAvIGNvbHVtbldpZHRoV2l0aEd1dHRlcjtcblxuXG4gIHRoaXMuX251bWJlck9mQ29sdW1ucyA9IE1hdGguZmxvb3IobkNvbHMpO1xufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX2NhbGN1bGF0ZVZpZXdQb3J0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBudW1iZXJPZlJvd3MgPSB0aGlzLmxheW91dC5nZXROdW1iZXJPZlJvd3MoKTtcblxuICAvLyBhdXRvLWFkanVzdHMgb24gd2lkdGhcbiAgLy8gdmFyIHdpZHRoID0gKHRoaXMuX251bWJlck9mQ29sdW1ucyAqIHRoaXMuX29wdGlvbnMuY29sdW1uV2lkdGgpICsgKHRoaXMuX251bWJlck9mQ29sdW1ucy0xKSAqIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZTtcbiAgdmFyIGhlaWdodCA9IChudW1iZXJPZlJvd3MgKiB0aGlzLl9vcHRpb25zLnJvd0hlaWdodCkgKyAobnVtYmVyT2ZSb3dzLyotMSovKSAqIHRoaXMuX29wdGlvbnMuZ3V0dGVyU2l6ZTtcblxuICByZXR1cm4gaGVpZ2h0O1xufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX2V4cGFuZFZpZXdQb3J0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjdXJyZW50SGVpZ2h0ID0gdGhpcy5fdmlld3BvcnQuc3R5bGUuaGVpZ2h0IHx8IDA7XG4gIGN1cnJlbnRIZWlnaHQgPSBwYXJzZUludChjdXJyZW50SGVpZ2h0LCAxMCk7XG5cbiAgaWYgKGN1cnJlbnRIZWlnaHQgPCB0aGlzLl9jYWxjdWxhdGVWaWV3UG9ydEhlaWdodCgpKSB7XG4gICAgdGhpcy5fcmVzaXplVmlld1BvcnQoKTtcbiAgfVxufTtcbk1hc29ucnkucHJvdG90eXBlLl9yZXNpemVWaWV3UG9ydCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbnVtYmVyT2ZSb3dzID0gdGhpcy5sYXlvdXQuZ2V0TnVtYmVyT2ZSb3dzKCk7XG4gIHZhciBoZWlnaHQgPSB0aGlzLl9jYWxjdWxhdGVWaWV3UG9ydEhlaWdodCgpO1xuXG4gIHRoaXMuX3ZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcmVzZXRJdGVtVHJhbnNmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuID0gdGhpcy5faXRlbXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyICRpdGVtID0gdGhpcy5faXRlbXNbaV07XG5cbiAgICAvLyBGSVhNRSBkb24ndCBlZGl0IHRoZSBET00gb2JqZWN0LCBoYXZlIGFuIGludGVybmFsIGhhc2htYXAgaW5zdGVhZFxuICAgICRpdGVtLl9zdHlsZXMgPSB7fTtcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3NldEhpZGRlblN0eWxlID0gZnVuY3Rpb24oJGl0ZW0pIHtcbiAgdmFyIHNjYWxlID0gdGhpcy5fb3B0aW9ucy5oaWRkZW5TdHlsZS5zY2FsZSB8fCAxO1xuICB0b2dnbGVDbGFzc05hbWUoJGl0ZW0sIHRoaXMuX29wdGlvbnMuaGlkZGVuQ2xhc3NOYW1lLCB0cnVlKTtcblxuICB2YXIgdHJhbnNmb3JtU3RyID0gJyc7XG4gIC8vIHRyYW5zZm9ybVN0ciArPSAndHJhbnNsYXRlM2QoJyt4KycsJyt5KycsMCkgJztcbiAgdHJhbnNmb3JtU3RyICs9ICdzY2FsZTNkKCcrc2NhbGUrJywgJytzY2FsZSsnLCAxKSc7XG5cbiAgJGl0ZW0uc3R5bGVbcHJlZml4ICsgJ1RyYW5zZm9ybSddID0gdHJhbnNmb3JtU3RyO1xufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3NldHVwSXRlbSA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIC8vIFRPRE8gYmV0dGVyIGNoZWNrXG4gIHZhciBpc0ZpcnN0VGltZSA9ICgkaXRlbS5zdHlsZS5wb3NpdGlvbiAhPT0gJ2Fic29sdXRlJyk7XG4gIGlmIChpc0ZpcnN0VGltZSkge1xuICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBhbmltYXRlIGluIG9uIHJlbmRlclxuICAgICRpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgcmVwYWludCgkaXRlbSk7XG4gICAgLy8gdGhpcy5fc2V0SGlkZGVuU3R5bGUoJGl0ZW0pO1xuXG4gICAgJGl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgLy8gVE9ETyBzaG91bGQgcHJvYmFibHkgYmUgcmUtd3JpdHRlbiBvbmNlIHdlIGdldCBpbnRvIGFkZGluZ1xuXG4gICAgdmFyIHggPSAkaXRlbS5fc3R5bGVzLng7XG4gICAgdmFyIHkgPSAkaXRlbS5fc3R5bGVzLnk7XG4gICAgdmFyIHNjYWxlID0gdGhpcy5fb3B0aW9ucy5oaWRkZW5TdHlsZS5zY2FsZSB8fCAxO1xuXG4gICAgdmFyIHRyYW5zZm9ybVN0ciA9ICcnO1xuICAgIHRyYW5zZm9ybVN0ciArPSAndHJhbnNsYXRlM2QoJyt4KycsJyt5KycsMCkgJztcbiAgICB0cmFuc2Zvcm1TdHIgKz0gJ3NjYWxlM2QoJytzY2FsZSsnLCAnK3NjYWxlKycsIDEpJztcblxuICAgICRpdGVtLnN0eWxlW3ByZWZpeCArICdUcmFuc2Zvcm0nXSA9IHRyYW5zZm9ybVN0cjtcblxuICAgICRpdGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIHJlcGFpbnQoJGl0ZW0ub2Zmc2V0SGVpZ2h0KTtcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3BlcmZvcm1JdGVtVHJhbnNmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGVuID0gdGhpcy5faXRlbXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyICRpdGVtID0gdGhpcy5faXRlbXNbaV07XG5cbiAgICAvLyBUT0RPXG4gICAgLy8gaWYgaXRlbSB3YXMgaGlkZGVuLCBcInRlbGVwb3J0XCIgKG5vIHRyYW5zaXRpb24pIGl0IHRvIGNvcnJlY3QgeCx5XG4gICAgLy8gdGhlbiBzY2FsZSAwIC0+IDFcblxuICAgIHZhciB4ID0gJGl0ZW0uX3N0eWxlcy54O1xuICAgIHZhciB5ID0gJGl0ZW0uX3N0eWxlcy55O1xuICAgIHZhciBzY2FsZSA9ICRpdGVtLl9zdHlsZXMuc2NhbGUgfHwgMTtcblxuXG4gICAgdGhpcy5fc2V0dXBJdGVtKCRpdGVtKTtcblxuICAgIGlmICh0cmFuc2xhdGUzZCkge1xuICAgICAgdmFyIHRyYW5zZm9ybVN0ciA9ICcnO1xuICAgICAgdHJhbnNmb3JtU3RyICs9ICd0cmFuc2xhdGUzZCgnK3grJywnK3krJywwKSAnO1xuICAgICAgdHJhbnNmb3JtU3RyICs9ICdzY2FsZTNkKCcrc2NhbGUrJywgJytzY2FsZSsnLCAxKSc7XG5cbiAgICAgICRpdGVtLnN0eWxlW3ByZWZpeCArICdUcmFuc2Zvcm0nXSA9IHRyYW5zZm9ybVN0cjtcblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPXG4gICAgfVxuICB9XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICAvLyBUT0RPIG5vdCBjcm9zcy1icm93c2VyXG4gIHNlbGYuX3ZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIodHJhbnNpdGlvbkVuZCwgZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5fb25UcmFuc2l0aW9uRW5kKCk7XG4gIH0pO1xuXG4gIHRvZ2dsZUNsYXNzTmFtZShzZWxmLl92aWV3cG9ydCwgJ25vLXRyYW5zaXRpb24nLCB0cnVlKTtcblxuICByZXBhaW50KHNlbGYuX3ZpZXdwb3J0KTtcbiAgc2VsZi5yZUxheW91dCgpO1xuXG4gIHJlcGFpbnQoc2VsZi5fdmlld3BvcnQpO1xuICB0b2dnbGVDbGFzc05hbWUoc2VsZi5fdmlld3BvcnQsICduby10cmFuc2l0aW9uJywgZmFsc2UpO1xuXG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fb25UcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLl9yZXNpemVWaWV3UG9ydCgpO1xufTtcblxuLyoqXG4gKiBAcHVibGljXG4gKiBAcmV0dXJuIE1hc29ucnlcbiAqL1xuTWFzb25yeS5wcm90b3R5cGUucmVMYXlvdXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5faXRlbXMgPSBbXS5zbGljZS5jYWxsKHRoaXMuX3ZpZXdwb3J0LmNoaWxkcmVuKTtcblxuICB0aGlzLl9maWx0ZXJJdGVtcygpO1xuICB0aGlzLl9zb3J0SXRlbXMoKTtcblxuICB0aGlzLl9jYWxjdWxhdGVOdW1iZXJPZkNvbHVtbnMoKTtcblxuICB0aGlzLmxheW91dCA9IG5ldyBNYXNvbnJ5TGF5b3V0KHRoaXMuX251bWJlck9mQ29sdW1ucyk7XG5cbiAgdGhpcy5fcG9zaXRpb25JdGVtcygpO1xuXG4gIHRoaXMuX3BlcmZvcm1JdGVtVHJhbnNmb3JtcygpO1xuXG4gIHRoaXMuX2V4cGFuZFZpZXdQb3J0KCk7XG5cbiAgLy8gVE9ET1xuICAvLyBzb21lIGtpbmQgb2YgdHJpZ2dlciB3aGVuIHJlTGF5b3V0IGlzIGRvbmU/XG4gIC8vIGNvdWxkIGJlIHVzZWQgdG8gY2xlYW4gdXAgdW4tdXNlZCBpdGVtcyBmcm9tIHRoZSBET00gdHJlZSBldGNcbiAgLy9cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbk1hc29ucnkucHJvdG90eXBlLmFkZEl0ZW0gPSBmdW5jdGlvbigkaXRlbSkge1xuICAvLyBwcmVwZW5kIHNvIGl0IGhhcyB0aGUgbG93ZXN0IHotaW5kZXhcbiAgaWYgKHRoaXMuX3ZpZXdwb3J0LmZpcnN0Q2hpbGQpIHtcbiAgICB0aGlzLl92aWV3cG9ydC5pbnNlcnRCZWZvcmUoJGl0ZW0sIHRoaXMuX3ZpZXdwb3J0LmZpcnN0Q2hpbGQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3ZpZXdwb3J0LmFwcGVuZENoaWxkKCRpdGVtKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5OyJdfQ==
(3)
});
