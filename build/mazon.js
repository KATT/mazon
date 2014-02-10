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

  // TODO
  // Change the order of `this._viewport.children`s in the DOM
  // only care about position of `this._filteredItems`

};


Masonry.prototype._setItemPosition = function($item, x, y) {
  x += 'px';
  y += 'px';

  var isFirstTime = ($item.style.position !== 'absolute'); // TODO better check
  if (isFirstTime) {
    $item.style.position = 'absolute';

    // make sure we don't animate in on render
    // TODO should probably be re-written once we get into adding
    $item.style.display = 'none';
    var repaint = $item.offsetHeight;
    $item.style.display = 'block';
  }

  // TODO below, check for translate3d support + vendor prefix
  if (translate3d) {

    // FIXME
    // create a list of style transforms in beginning of reLayout and apply after
    // this is not nice
    var scale = hasClassName($item, this._options.hiddenClassName) ? 0.01 : 1;
    var transformStr = '';
    transformStr += 'translate3d('+x+','+y+',0)';
    transformStr += ' scale3d('+scale+', '+scale+', 1)';

    $item.style[prefix + 'Transform'] = transformStr;

  } else {
    $item.style.left = x;
    $item.style.top = y;
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
  console.log('_performItemTransforms');
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

      console.log(transformStr);
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
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL2xpYi9sYXlvdXQtcG9pbnQuanMiLCIvVXNlcnMvYWpheC9kZXYvbWF6b24vbGliL2xheW91dC5qcyIsIi9Vc2Vycy9hamF4L2Rldi9tYXpvbi9tYXpvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuZnVuY3Rpb24gTWFzb25yeUxheW91dFBvaW50KHgsIHkpIHtcbiAgdGhpcy54ID0gTnVtYmVyKHgpO1xuICB0aGlzLnkgPSBOdW1iZXIoeSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5TGF5b3V0UG9pbnQ7IiwidmFyIE1hc29ucnlMYXlvdXRQb2ludCA9IHJlcXVpcmUoJy4vbGF5b3V0LXBvaW50Jyk7XG5cbi8qKlxuICogTWFzb25yeUxheW91dCwgaGVscHMgd2hlcmUgdG8gcHV0IHJlY3RhbmdsZXMgaW4gYW4gWCpZIGdyaWQsXG4gKiBhdXRvbWF0aWNhbGx5IGV4dGVuZGluZyB2ZXJ0aWNhbGx5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IE51bWJlciBvZiBjb2x1bW5zIHRoYXQgdGhpcyBsYXlvdXQgY29udGFpbnNcbiAqL1xuZnVuY3Rpb24gTWFzb25yeUxheW91dChfbkNvbHMsIG1hdHJpeCkge1xuICB0aGlzLl9uQ29scyA9IF9uQ29scztcbiAgdGhpcy5fbWF0cml4ID0gbWF0cml4IHx8IFtdO1xufVxuXG5cblxuLyoqXG4gKiBGaW5kcyBuZXh0IGZyZWUgcG9pbnQgaW4gbWF0cml4XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBOdW1iZXIgb2YgcG9pbnRzIHRvIGlnbm9yZVxuICogQHJldHVybiB7TWFzb25yeUxheW91dFBvaW50fVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fZmluZE5leHRGcmVlUG9pbnQgPSBmdW5jdGlvbihza2lwKSB7XG4gIHZhciBjb2xzLCBpLCBpc1Rha2VuLCB4LCB5LCBfbWF0cml4O1xuICBpZiAoIXNraXApIHtcbiAgICBza2lwID0gMDtcbiAgfVxuXG4gIGkgPSAwO1xuICBfbWF0cml4ID0gdGhpcy5fbWF0cml4O1xuXG4gIC8vIFN0ZXAgdGhyb3VnaCByb3dzIGluIG1hdHJpeFxuICBmb3IgKHkgPSAwOyB5IDwgX21hdHJpeC5sZW5ndGg7IHkrKykge1xuICAgIGNvbHMgPSBfbWF0cml4W3ldO1xuICAgIC8vIFN0ZXAgdGhyb3VnaCBjb2xzXG4gICAgZm9yICh4ID0gMDsgeCA8IGNvbHMubGVuZ3RoOyB4KyspIHtcbiAgICAgIC8vIElzIHRoaXMgc3BhY2UgZnJlZT9cbiAgICAgIGlzVGFrZW4gPSBjb2xzW3hdO1xuICAgICAgaWYgKCFpc1Rha2VuKSB7XG4gICAgICAgIGlmIChza2lwIDw9IGkrKykge1xuICAgICAgICAgIHJldHVybiBuZXcgTWFzb25yeUxheW91dFBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2UgZGlkbid0IGZpbmQgYW55IGZyZWUgc3BhY2UgaW4gdGhlIHdob2xlIE1hdHJpeCFcbiAgLy8gcmV0dXJuIGZpcnN0IHBvc2l0aW9uIG9mIG5leHQgbGluZVxuICByZXR1cm4gbmV3IE1hc29ucnlMYXlvdXRQb2ludCgwLCBfbWF0cml4Lmxlbmd0aCk7XG59O1xuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fYWRkTmV3Um93ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB5ID0gdGhpcy5fbWF0cml4Lmxlbmd0aDtcblxuICB0aGlzLl9tYXRyaXhbeV0gPSBbXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgdGhpcy5fbkNvbHM7IGkrKykge1xuICAgIHRoaXMuX21hdHJpeFt5XVtpXSA9IDA7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBvaW50IGluIHRoZSBtYXRyaXggZml0cyB0byBob2xkIGEgcmVjdGFuZ2xlIHdpdGggc2l6ZVxuICpcbiAqIEBwYXJhbSAge01hc29ucnlMYXlvdXRQb2ludH0gcG9zaXRpb25cbiAqIEBwYXJhbSAge051bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSAge051bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fY2hlY2tJZlBvaW50Rml0c1JlY3QgPSBmdW5jdGlvbihwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgZHgsIGksIHgsIHksIGosIGNvbCwgcm93LCBtYXRyaXg7XG5cblxuICBtYXRyaXggPSB0aGlzLl9tYXRyaXg7XG5cbiAgeCA9IHBvc2l0aW9uLng7XG4gIHkgPSBwb3NpdGlvbi55O1xuXG4gIC8vIHRlc3Qgb3V0IG9mIGJvdW5kc1xuICB2YXIgb3V0T2ZCb3VuZHNYID0gKHgrd2lkdGggPiB0aGlzLl9uQ29scyk7XG4gIGlmIChvdXRPZkJvdW5kc1gpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBzZWUgaWYgYWxsIHRoZSBwb2ludHMgYXJlIGVtcHR5XG4gIGZvciAoaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgIHJvdyA9ICh5K2kpO1xuICAgIGlmICghbWF0cml4W3Jvd10pIHtcbiAgICAgIC8vIHJvdyBkb2Vzbid0IGV4aXN0XG4gICAgICAvLyBubyByb3cgd2lsbCBleGlzdCBhZnRlciBlaXRoZXJcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBzdGVwIHRocm91Z2ggdGhpcyByb3cncyBjb2x1bW5zXG4gICAgZm9yIChqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIGNvbCA9ICh4K2opO1xuXG4gICAgICAvLyB0ZXN0IGJ1c3lcbiAgICAgIGlmIChtYXRyaXhbcm93XVtjb2xdID09PSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogR2V0IGZpcnN0IGF2YWlsYWJsZSBwb3NpdGlvbiBmb3IgcmVjdGFuZ2xlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtICB7TnVtYmVyfSBoZWlnaHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB0aGUgZ3JpZCBpcyB0b28gc21hbGwgdG8gZml0IHJlY3RcbiAqIEByZXR1cm4ge01hc29ucnlMYXlvdXRQb2ludH1cbiAqL1xuTWFzb25yeUxheW91dC5wcm90b3R5cGUuZ2V0UG9zaXRpb25Gb3JSZWN0ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgcG9zaXRpb24sIGZvdW5kLCBpO1xuXG4gIGkgPSAwO1xuICBmb3VuZCA9IGZhbHNlO1xuICBpZiAod2lkdGggPiB0aGlzLl9uQ29scykge1xuICAgIHRocm93IG5ldyBFcnJvcignTGF5b3V0IG1hdHJpeCBpcyB0b28gc21hbGwgdG8gZml0IGFueSByZWN0YW5nbGUgd2lkdGggd2lkdGggJyArIHdpZHRoKTtcbiAgfVxuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLl9maW5kTmV4dEZyZWVQb2ludChpKyspO1xuXG4gICAgaWYgKHRoaXMuX2NoZWNrSWZQb2ludEZpdHNSZWN0KHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KSkge1xuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcG9zaXRpb247XG59O1xuXG4vKipcbiAqIEFkZCBhIHJlY3RhbmdsZSB0byBtYXRyaXhcbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICogQHJldHVybiB7TWFzb25yeUxheW91dFBvaW50fVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5hZGRSZWN0ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uRm9yUmVjdCh3aWR0aCwgaGVpZ2h0KTtcbiAgdmFyIHkgPSBwb3NpdGlvbi55O1xuICB2YXIgeCA9IHBvc2l0aW9uLng7XG4gIHZhciBpO1xuICB2YXIgajtcblxuICBmb3IgKGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICAvLyBhZGQgbmV3IHJvdyBpZiBuZWVkZWRcbiAgICBpZiAoIXRoaXMuX21hdHJpeFt5K2ldKSB7XG4gICAgICB0aGlzLl9hZGROZXdSb3coKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgYmxvY2sgb24gd2lkdGggYW5kIGhlaWdodFxuICAgIGZvciAoaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICB0aGlzLl9tYXRyaXhbeStpXVtqK3hdID0gMTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBwb3NpdGlvbjtcbn07XG5cblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuZ2V0TnVtYmVyT2ZSb3dzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9tYXRyaXgubGVuZ3RoO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnlMYXlvdXQ7XG4iLCJ2YXIgTWFzb25yeUxheW91dCA9IHJlcXVpcmUoJy4vbGliL2xheW91dCcpO1xuXG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgY29sdW1uV2lkdGg6IDEwMCxcbiAgcm93SGVpZ2h0OiAxMDAsXG4gIGd1dHRlclNpemU6IDEwLFxuICBmaWx0ZXJDYWxsYmFjazogbnVsbCxcbiAgc29ydENhbGxiYWNrOiBudWxsLFxuICBoaWRkZW5DbGFzc05hbWU6ICdoaWRkZW4nLFxuICBoaWRkZW5TdHlsZToge1xuICAgIHNjYWxlOiAwLjAxXG4gIH0sXG4gIHZpc2libGVTdHlsZToge1xuICAgIHNjYWxlOiAxXG4gIH1cbn07XG5cbmZ1bmN0aW9uIGV4dGVuZChvMSwgbzIpIHtcbiAgZm9yICh2YXIgayBpbiBvMikge1xuICAgIGlmIChvMi5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgbzFba10gPSBvMltrXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG8xO1xufVxuXG5cbi8vIEBsaW5rIGh0dHA6Ly9kYXZpZHdhbHNoLm5hbWUvdmVuZG9yLXByZWZpeFxudmFyIHByZWZpeCA9ICd3ZWJraXQnO1xuXG52YXIgdHJhbnNsYXRlM2QgPSB0cnVlOyAvLyBGSVhNRSBjaGVjayBmb3Igc3VwcG9ydFxuXG5cbnZhciBoYXNDbGFzc05hbWUgPSBmdW5jdGlvbiB0b2dnbGVDbGFzc05hbWUoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gIHZhciBoYXNDbGFzc05hbWVSZWdFeCA9IG5ldyBSZWdFeHAoJyg/Ol58XFxcXHMpJyArIGNsYXNzTmFtZSArICcoPyFcXFxcUyknLCAnZycpO1xuXG4gIHJldHVybiBoYXNDbGFzc05hbWVSZWdFeC50ZXN0KGVsZW1lbnQuY2xhc3NOYW1lKTtcbn07XG5cblxudmFyIHRvZ2dsZUNsYXNzTmFtZSA9IGZ1bmN0aW9uIHRvZ2dsZUNsYXNzTmFtZShlbGVtZW50LCBjbGFzc05hbWUsIHNob3cpIHtcbiAgdmFyIGhhc0NsYXNzTmFtZVJlZ0V4ID0gbmV3IFJlZ0V4cCgnKD86XnxcXFxccyknICsgY2xhc3NOYW1lICsgJyg/IVxcXFxTKScsICdnJyk7XG4gIHZhciBjbGFzc0xpc3QgPSBlbGVtZW50LmNsYXNzTmFtZTtcblxuICB2YXIgbmV3Q2xhc3NMaXN0ID0gY2xhc3NMaXN0O1xuICBpZiAoc2hvdykge1xuICAgIGlmIChoYXNDbGFzc05hbWUoZWxlbWVudCwgY2xhc3NOYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBuZXdDbGFzc0xpc3QgKz0gJyAnICsgY2xhc3NOYW1lO1xuICB9IGVsc2Uge1xuICAgIG5ld0NsYXNzTGlzdCA9IGNsYXNzTGlzdC5yZXBsYWNlKGhhc0NsYXNzTmFtZVJlZ0V4LCAnICcpO1xuICB9XG4gIC8vIHJlbW92ZSBkb3VibGUgc3BhY2VzXG4gIG5ld0NsYXNzTGlzdCA9IG5ld0NsYXNzTGlzdC5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cbiAgLy8gdHJpbSB3aGl0ZXNwYWNlXG4gIG5ld0NsYXNzTGlzdCA9IG5ld0NsYXNzTGlzdC5yZXBsYWNlKC8oXlxccyt8XFxzKyQpL2csICcnKTtcblxuICBlbGVtZW50LmNsYXNzTmFtZSA9IG5ld0NsYXNzTGlzdDtcbn07XG5cbmZ1bmN0aW9uIE1hc29ucnkoZWxlbWVudElELCBvcHRzKSB7XG4gIHRoaXMuX3ZpZXdwb3J0SUQgPSBlbGVtZW50SUQ7XG4gIHRoaXMuX3ZpZXdwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudElEKTtcblxuICB0aGlzLl9vcHRpb25zID0ge307XG4gIHRoaXMuX29wdGlvbnMgPSBleHRlbmQodGhpcy5fb3B0aW9ucywgZGVmYXVsdE9wdGlvbnMpO1xuICB0aGlzLl9vcHRpb25zID0gZXh0ZW5kKHRoaXMuX29wdGlvbnMsIG9wdHMpO1xuXG4gIHRoaXMuX2ZpbHRlcmVkSXRlbXMgPSBbXTtcbiAgdGhpcy5faGlkZGVuSXRlbXMgPSBbXTtcblxuICB0aGlzLnJlTGF5b3V0KCk7XG59XG5cblxuXG5NYXNvbnJ5LnByb3RvdHlwZS5fZmlsdGVySXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fZmlsdGVyZWRJdGVtcyA9IFtdO1xuICB0aGlzLl9oaWRkZW5JdGVtcyA9IFtdO1xuXG4gIHZhciBsZW4gPSB0aGlzLl9pdGVtcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgJGl0ZW0gPSB0aGlzLl9pdGVtc1tpXTtcblxuICAgIHZhciBzaG93ID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLl9vcHRpb25zLmZpbHRlckNhbGxiYWNrKSB7XG4gICAgICBzaG93ID0gdGhpcy5fb3B0aW9ucy5maWx0ZXJDYWxsYmFjaygkaXRlbSk7XG4gICAgfVxuXG4gICAgaWYgKHNob3cpIHtcbiAgICAgIHRoaXMuX2ZpbHRlcmVkSXRlbXMucHVzaCgkaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2hpZGRlbkl0ZW1zLnB1c2goJGl0ZW0pO1xuICAgIH1cblxuICAgIC8vIHVwZGF0ZSB0aGUgQ1NTICYgc3R5bGVzXG4gICAgdG9nZ2xlQ2xhc3NOYW1lKCRpdGVtLCB0aGlzLl9vcHRpb25zLmhpZGRlbkNsYXNzTmFtZSwgIXNob3cpO1xuXG4gICAgdmFyIHN0eWxlcyA9IHNob3cgPyB0aGlzLl9vcHRpb25zLnZpc2libGVTdHlsZSA6IHRoaXMuX29wdGlvbnMuaGlkZGVuU3R5bGU7XG4gICAgJGl0ZW0uX3N0eWxlcyA9ICRpdGVtLl9zdHlsZXMgfHwge307XG4gICAgJGl0ZW0uX3N0eWxlcyA9IGV4dGVuZCgkaXRlbS5fc3R5bGVzLCBzdHlsZXMpO1xuICB9XG59O1xuXG5cbk1hc29ucnkucHJvdG90eXBlLl9zb3J0SXRlbXMgPSBmdW5jdGlvbigpIHtcblxuICAvLyBUT0RPXG4gIC8vIENoYW5nZSB0aGUgb3JkZXIgb2YgYHRoaXMuX3ZpZXdwb3J0LmNoaWxkcmVuYHMgaW4gdGhlIERPTVxuICAvLyBvbmx5IGNhcmUgYWJvdXQgcG9zaXRpb24gb2YgYHRoaXMuX2ZpbHRlcmVkSXRlbXNgXG5cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuX3NldEl0ZW1Qb3NpdGlvbiA9IGZ1bmN0aW9uKCRpdGVtLCB4LCB5KSB7XG4gIHggKz0gJ3B4JztcbiAgeSArPSAncHgnO1xuXG4gIHZhciBpc0ZpcnN0VGltZSA9ICgkaXRlbS5zdHlsZS5wb3NpdGlvbiAhPT0gJ2Fic29sdXRlJyk7IC8vIFRPRE8gYmV0dGVyIGNoZWNrXG4gIGlmIChpc0ZpcnN0VGltZSkge1xuICAgICRpdGVtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcblxuICAgIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBhbmltYXRlIGluIG9uIHJlbmRlclxuICAgIC8vIFRPRE8gc2hvdWxkIHByb2JhYmx5IGJlIHJlLXdyaXR0ZW4gb25jZSB3ZSBnZXQgaW50byBhZGRpbmdcbiAgICAkaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHZhciByZXBhaW50ID0gJGl0ZW0ub2Zmc2V0SGVpZ2h0O1xuICAgICRpdGVtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICB9XG5cbiAgLy8gVE9ETyBiZWxvdywgY2hlY2sgZm9yIHRyYW5zbGF0ZTNkIHN1cHBvcnQgKyB2ZW5kb3IgcHJlZml4XG4gIGlmICh0cmFuc2xhdGUzZCkge1xuXG4gICAgLy8gRklYTUVcbiAgICAvLyBjcmVhdGUgYSBsaXN0IG9mIHN0eWxlIHRyYW5zZm9ybXMgaW4gYmVnaW5uaW5nIG9mIHJlTGF5b3V0IGFuZCBhcHBseSBhZnRlclxuICAgIC8vIHRoaXMgaXMgbm90IG5pY2VcbiAgICB2YXIgc2NhbGUgPSBoYXNDbGFzc05hbWUoJGl0ZW0sIHRoaXMuX29wdGlvbnMuaGlkZGVuQ2xhc3NOYW1lKSA/IDAuMDEgOiAxO1xuICAgIHZhciB0cmFuc2Zvcm1TdHIgPSAnJztcbiAgICB0cmFuc2Zvcm1TdHIgKz0gJ3RyYW5zbGF0ZTNkKCcreCsnLCcreSsnLDApJztcbiAgICB0cmFuc2Zvcm1TdHIgKz0gJyBzY2FsZTNkKCcrc2NhbGUrJywgJytzY2FsZSsnLCAxKSc7XG5cbiAgICAkaXRlbS5zdHlsZVtwcmVmaXggKyAnVHJhbnNmb3JtJ10gPSB0cmFuc2Zvcm1TdHI7XG5cbiAgfSBlbHNlIHtcbiAgICAkaXRlbS5zdHlsZS5sZWZ0ID0geDtcbiAgICAkaXRlbS5zdHlsZS50b3AgPSB5O1xuICB9XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcG9zaXRpb25JdGVtVG9Qb2ludCA9IGZ1bmN0aW9uKCRpdGVtLCBwb2ludCkge1xuICB2YXIgeCA9IHBvaW50LnggKiB0aGlzLl9vcHRpb25zLmNvbHVtbldpZHRoO1xuICB2YXIgeSA9IHBvaW50LnkgKiB0aGlzLl9vcHRpb25zLnJvd0hlaWdodDtcblxuICB4ICs9ICh0aGlzLl9vcHRpb25zLmd1dHRlclNpemUgKiBwb2ludC54KTtcbiAgeSArPSAodGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplICogcG9pbnQueSk7XG5cbiAgJGl0ZW0uX3N0eWxlcyA9ICRpdGVtLl9zdHlsZXMgfHwge307XG4gICRpdGVtLl9zdHlsZXMgPSBleHRlbmQoJGl0ZW0uX3N0eWxlcywge1xuICAgIHg6IHggKyAncHgnLFxuICAgIHk6IHkgKyAncHgnXG4gIH0pO1xufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX2dldEl0ZW1MYXlvdXRTcGFuID0gZnVuY3Rpb24oJGl0ZW0pIHtcbiAgLy8gVE9ET1xuICAvLyBtb3ZlIGd1dHRlciBtYXRoIGludG8gTWFzb25yeUxheW91dCBjb21wb25lbnQvc3ViY2xhc3M/XG4gIC8vIG1ha2UgTWFzb25yeUxheW91dFNwYW4gZm9yIHRoaXMgb2JqZWN0P1xuICAvLyBob3cgbWFueSBjb2wvcm93cyBkb2VzIHRoaXMgaXRlbSBvY2N1cHlcbiAgLy8gbWVtb2l6ZSByZXN1bHRzP1xuICB2YXIgaXRlbUNvbFNwYW4gPSAkaXRlbS5vZmZzZXRXaWR0aCAgLyB0aGlzLl9vcHRpb25zLmNvbHVtbldpZHRoO1xuICB2YXIgaXRlbVJvd1NwYW4gPSAkaXRlbS5vZmZzZXRIZWlnaHQgLyB0aGlzLl9vcHRpb25zLnJvd0hlaWdodDtcblxuICAvLyBkb24ndCBpbmNsdWRlIHRoZSBndXR0ZXIgaW4gdGhlIGNhbGN1bGF0aW9uXG4gIGl0ZW1Db2xTcGFuIC09ICh0aGlzLl9vcHRpb25zLmd1dHRlclNpemUvdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aCkgKiBNYXRoLmZsb29yKGl0ZW1Db2xTcGFuIC0gMSk7XG4gIGl0ZW1Sb3dTcGFuIC09ICh0aGlzLl9vcHRpb25zLmd1dHRlclNpemUvdGhpcy5fb3B0aW9ucy5yb3dIZWlnaHQpICogTWF0aC5mbG9vcihpdGVtUm93U3BhbiAtIDEpO1xuXG4gIC8vIHJvdW5kIHVwXG4gIGl0ZW1Db2xTcGFuID0gTWF0aC5jZWlsKGl0ZW1Db2xTcGFuKTtcbiAgaXRlbVJvd1NwYW4gPSBNYXRoLmNlaWwoaXRlbVJvd1NwYW4pO1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGl0ZW1Db2xTcGFuLFxuICAgIGhlaWdodDogaXRlbVJvd1NwYW5cbiAgfTtcbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9wb3NpdGlvbkl0ZW1zID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZW4gPSB0aGlzLl9maWx0ZXJlZEl0ZW1zLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciAkaXRlbSA9IHRoaXMuX2ZpbHRlcmVkSXRlbXNbaV07XG5cbiAgICB2YXIgc3BhbiA9IHRoaXMuX2dldEl0ZW1MYXlvdXRTcGFuKCRpdGVtKTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmxheW91dC5hZGRSZWN0KHNwYW4ud2lkdGgsIHNwYW4uaGVpZ2h0KTtcblxuICAgIHRoaXMuX3Bvc2l0aW9uSXRlbVRvUG9pbnQoJGl0ZW0sIHBvc2l0aW9uKTtcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX2NhbGN1bGF0ZU51bWJlck9mQ29sdW1ucyA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciB2aWV3UG9ydEV4dHJhR3V0dGVyID0gKHRoaXMuX3ZpZXdwb3J0Lm9mZnNldFdpZHRoICsgdGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplKTtcbiAgdmFyIGNvbHVtbldpZHRoV2l0aEd1dHRlciA9ICh0aGlzLl9vcHRpb25zLmNvbHVtbldpZHRoICsgdGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplKTtcblxuICB2YXIgbkNvbHMgPSB2aWV3UG9ydEV4dHJhR3V0dGVyIC8gY29sdW1uV2lkdGhXaXRoR3V0dGVyO1xuXG5cbiAgdGhpcy5fbnVtYmVyT2ZDb2x1bW5zID0gTWF0aC5mbG9vcihuQ29scyk7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcmVzaXplVmlld1BvcnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG51bWJlck9mUm93cyA9IHRoaXMubGF5b3V0LmdldE51bWJlck9mUm93cygpO1xuXG4gIC8vIGF1dG8tYWRqdXN0cyBvbiB3aWR0aFxuICAvLyB2YXIgd2lkdGggPSAodGhpcy5fbnVtYmVyT2ZDb2x1bW5zICogdGhpcy5fb3B0aW9ucy5jb2x1bW5XaWR0aCkgKyAodGhpcy5fbnVtYmVyT2ZDb2x1bW5zLTEpICogdGhpcy5fb3B0aW9ucy5ndXR0ZXJTaXplO1xuICB2YXIgaGVpZ2h0ID0gKG51bWJlck9mUm93cyAqIHRoaXMuX29wdGlvbnMucm93SGVpZ2h0KSArIChudW1iZXJPZlJvd3MtMSkgKiB0aGlzLl9vcHRpb25zLmd1dHRlclNpemU7XG5cbiAgdGhpcy5fdmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4Jztcbn07XG5cbk1hc29ucnkucHJvdG90eXBlLl9yZXNldEl0ZW1UcmFuc2Zvcm1zID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZW4gPSB0aGlzLl9pdGVtcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgJGl0ZW0gPSB0aGlzLl9pdGVtc1tpXTtcblxuICAgIC8vIEZJWE1FIGRvbid0IGVkaXQgdGhlIERPTSBvYmplY3QsIGhhdmUgYW4gaW50ZXJuYWwgaGFzaG1hcCBpbnN0ZWFkXG4gICAgJGl0ZW0uX3N0eWxlcyA9IHt9O1xuICB9XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5fcHJlcGFyZUl0ZW0gPSBmdW5jdGlvbigkaXRlbSkge1xuICAvLyBUT0RPIGJldHRlciBjaGVja1xuICB2YXIgaXNGaXJzdFRpbWUgPSAoJGl0ZW0uc3R5bGUucG9zaXRpb24gIT09ICdhYnNvbHV0ZScpO1xuICBpZiAoaXNGaXJzdFRpbWUpIHtcbiAgICAkaXRlbS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cbiAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgYW5pbWF0ZSBpbiBvbiByZW5kZXJcbiAgICAvLyBUT0RPIHNob3VsZCBwcm9iYWJseSBiZSByZS13cml0dGVuIG9uY2Ugd2UgZ2V0IGludG8gYWRkaW5nXG4gICAgJGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB2YXIgcmVwYWludCA9ICRpdGVtLm9mZnNldEhlaWdodDtcbiAgICAkaXRlbS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuX3BlcmZvcm1JdGVtVHJhbnNmb3JtcyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnX3BlcmZvcm1JdGVtVHJhbnNmb3JtcycpO1xuICB2YXIgbGVuID0gdGhpcy5faXRlbXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyICRpdGVtID0gdGhpcy5faXRlbXNbaV07XG4gICAgdGhpcy5fcHJlcGFyZUl0ZW0oJGl0ZW0pO1xuXG4gICAgdmFyIHggPSAkaXRlbS5fc3R5bGVzLng7XG4gICAgdmFyIHkgPSAkaXRlbS5fc3R5bGVzLnk7XG4gICAgdmFyIHNjYWxlID0gJGl0ZW0uX3N0eWxlcy5zY2FsZSB8fCAxO1xuXG4gICAgaWYgKHRyYW5zbGF0ZTNkKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtU3RyID0gJyc7XG4gICAgICB0cmFuc2Zvcm1TdHIgKz0gJ3RyYW5zbGF0ZTNkKCcreCsnLCcreSsnLDApICc7XG4gICAgICB0cmFuc2Zvcm1TdHIgKz0gJ3NjYWxlM2QoJytzY2FsZSsnLCAnK3NjYWxlKycsIDEpJztcblxuICAgICAgY29uc29sZS5sb2codHJhbnNmb3JtU3RyKTtcbiAgICAgICRpdGVtLnN0eWxlW3ByZWZpeCArICdUcmFuc2Zvcm0nXSA9IHRyYW5zZm9ybVN0cjtcblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBwdWJsaWNcbiAqIEByZXR1cm4gTWFzb25yeVxuICovXG5NYXNvbnJ5LnByb3RvdHlwZS5yZUxheW91dCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9pdGVtcyA9IFtdLnNsaWNlLmNhbGwodGhpcy5fdmlld3BvcnQuY2hpbGRyZW4pO1xuXG4gIHRoaXMuX2ZpbHRlckl0ZW1zKCk7XG4gIHRoaXMuX3NvcnRJdGVtcygpO1xuXG4gIHRoaXMuX2NhbGN1bGF0ZU51bWJlck9mQ29sdW1ucygpO1xuXG4gIHRoaXMubGF5b3V0ID0gbmV3IE1hc29ucnlMYXlvdXQodGhpcy5fbnVtYmVyT2ZDb2x1bW5zKTtcblxuICB0aGlzLl9wb3NpdGlvbkl0ZW1zKCk7XG5cbiAgdGhpcy5fcGVyZm9ybUl0ZW1UcmFuc2Zvcm1zKCk7XG5cbiAgdGhpcy5fcmVzaXplVmlld1BvcnQoKTtcblxuICAvLyBUT0RPXG4gIC8vIHNvbWUga2luZCBvZiB0cmlnZ2VyIHdoZW4gcmVMYXlvdXQgaXMgZG9uZT9cbiAgLy8gY291bGQgYmUgdXNlZCB0byBjbGVhbiB1cCB1bi11c2VkIGl0ZW1zIGZyb20gdGhlIERPTSB0cmVlIGV0Y1xuICAvL1xuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTsiXX0=
(3)
});
