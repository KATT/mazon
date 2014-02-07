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
    $item.style.position = 'absolute';

    // make sure we don't animate in on render
    // TODO should probably be re-written once we get into adding
    $item.style.display = 'none';
    var repaint = $item.offsetHeight;
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
  };
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
},{"./lib/layout":2}]},{},[3])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL2xpYi9sYXlvdXQtcG9pbnQuanMiLCIvVXNlcnMvYWpheC9kZXYvbWF6b24vbGliL2xheW91dC5qcyIsIi9Vc2Vycy9hamF4L2Rldi9tYXpvbi9tYXpvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuZnVuY3Rpb24gTWFzb25yeUxheW91dFBvaW50KHgsIHkpIHtcbiAgdGhpcy54ID0gTnVtYmVyKHgpO1xuICB0aGlzLnkgPSBOdW1iZXIoeSk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5TGF5b3V0UG9pbnQ7IiwidmFyIE1hc29ucnlMYXlvdXRQb2ludCA9IHJlcXVpcmUoJy4vbGF5b3V0LXBvaW50Jyk7XG5cbi8qKlxuICogTWFzb25yeUxheW91dCwgaGVscHMgd2hlcmUgdG8gcHV0IHJlY3RhbmdsZXMgaW4gYW4gWCpZIGdyaWQsXG4gKiBhdXRvbWF0aWNhbGx5IGV4dGVuZGluZyB2ZXJ0aWNhbGx5XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IE51bWJlciBvZiBjb2x1bW5zIHRoYXQgdGhpcyBsYXlvdXQgY29udGFpbnNcbiAqL1xuZnVuY3Rpb24gTWFzb25yeUxheW91dChfbkNvbHMsIG1hdHJpeCkge1xuICB0aGlzLl9uQ29scyA9IF9uQ29scztcbiAgdGhpcy5fbWF0cml4ID0gbWF0cml4IHx8IFtdO1xufVxuXG5cblxuLyoqXG4gKiBGaW5kcyBuZXh0IGZyZWUgcG9pbnQgaW4gbWF0cml4XG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSBOdW1iZXIgb2YgcG9pbnRzIHRvIGlnbm9yZVxuICogQHJldHVybiB7TWFzb25yeUxheW91dFBvaW50fVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fZmluZE5leHRGcmVlUG9pbnQgPSBmdW5jdGlvbihza2lwKSB7XG4gIHZhciBjb2xzLCBpLCBpc1Rha2VuLCB4LCB5LCBfbWF0cml4O1xuICBpZiAoIXNraXApIHtcbiAgICBza2lwID0gMDtcbiAgfVxuXG4gIGkgPSAwO1xuICBfbWF0cml4ID0gdGhpcy5fbWF0cml4O1xuXG4gIC8vIFN0ZXAgdGhyb3VnaCByb3dzIGluIG1hdHJpeFxuICBmb3IgKHkgPSAwOyB5IDwgX21hdHJpeC5sZW5ndGg7IHkrKykge1xuICAgIGNvbHMgPSBfbWF0cml4W3ldO1xuICAgIC8vIFN0ZXAgdGhyb3VnaCBjb2xzXG4gICAgZm9yICh4ID0gMDsgeCA8IGNvbHMubGVuZ3RoOyB4KyspIHtcbiAgICAgIC8vIElzIHRoaXMgc3BhY2UgZnJlZT9cbiAgICAgIGlzVGFrZW4gPSBjb2xzW3hdO1xuICAgICAgaWYgKCFpc1Rha2VuKSB7XG4gICAgICAgIGlmIChza2lwIDw9IGkrKykge1xuICAgICAgICAgIHJldHVybiBuZXcgTWFzb25yeUxheW91dFBvaW50KHgsIHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2UgZGlkbid0IGZpbmQgYW55IGZyZWUgc3BhY2UgaW4gdGhlIHdob2xlIE1hdHJpeCFcbiAgLy8gcmV0dXJuIGZpcnN0IHBvc2l0aW9uIG9mIG5leHQgbGluZVxuICByZXR1cm4gbmV3IE1hc29ucnlMYXlvdXRQb2ludCgwLCBfbWF0cml4Lmxlbmd0aCk7XG59O1xuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fYWRkTmV3Um93ID0gZnVuY3Rpb24oKSB7XG4gIHZhciB5ID0gdGhpcy5fbWF0cml4Lmxlbmd0aDtcblxuICB0aGlzLl9tYXRyaXhbeV0gPSBbXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgdGhpcy5fbkNvbHM7IGkrKykge1xuICAgIHRoaXMuX21hdHJpeFt5XVtpXSA9IDA7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDaGVjayBpZiBhIHBvaW50IGluIHRoZSBtYXRyaXggZml0cyB0byBob2xkIGEgcmVjdGFuZ2xlIHdpdGggc2l6ZVxuICpcbiAqIEBwYXJhbSAge01hc29ucnlMYXlvdXRQb2ludH0gcG9zaXRpb25cbiAqIEBwYXJhbSAge051bWJlcn0gd2lkdGhcbiAqIEBwYXJhbSAge051bWJlcn0gaGVpZ2h0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fY2hlY2tJZlBvaW50Rml0c1JlY3QgPSBmdW5jdGlvbihwb3NpdGlvbiwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgZHgsIGksIHgsIHksIGosIGNvbCwgcm93LCBtYXRyaXg7XG5cblxuICBtYXRyaXggPSB0aGlzLl9tYXRyaXg7XG5cbiAgeCA9IHBvc2l0aW9uLng7XG4gIHkgPSBwb3NpdGlvbi55O1xuXG4gIC8vIHRlc3Qgb3V0IG9mIGJvdW5kc1xuICB2YXIgb3V0T2ZCb3VuZHNYID0gKHgrd2lkdGggPiB0aGlzLl9uQ29scyk7XG4gIGlmIChvdXRPZkJvdW5kc1gpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBzZWUgaWYgYWxsIHRoZSBwb2ludHMgYXJlIGVtcHR5XG4gIGZvciAoaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgIHJvdyA9ICh5K2kpO1xuICAgIGlmICghbWF0cml4W3Jvd10pIHtcbiAgICAgIC8vIHJvdyBkb2Vzbid0IGV4aXN0XG4gICAgICAvLyBubyByb3cgd2lsbCBleGlzdCBhZnRlciBlaXRoZXJcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBzdGVwIHRocm91Z2ggdGhpcyByb3cncyBjb2x1bW5zXG4gICAgZm9yIChqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIGNvbCA9ICh4K2opO1xuXG4gICAgICAvLyB0ZXN0IGJ1c3lcbiAgICAgIGlmIChtYXRyaXhbcm93XVtjb2xdID09PSAxKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogR2V0IGZpcnN0IGF2YWlsYWJsZSBwb3NpdGlvbiBmb3IgcmVjdGFuZ2xlXG4gKlxuICogQHBhcmFtICB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtICB7TnVtYmVyfSBoZWlnaHRcbiAqIEB0aHJvd3Mge0Vycm9yfSBpZiB0aGUgZ3JpZCBpcyB0b28gc21hbGwgdG8gZml0IHJlY3RcbiAqIEByZXR1cm4ge01hc29ucnlMYXlvdXRQb2ludH1cbiAqL1xuTWFzb25yeUxheW91dC5wcm90b3R5cGUuZ2V0UG9zaXRpb25Gb3JSZWN0ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgcG9zaXRpb24sIGZvdW5kLCBpO1xuXG4gIGkgPSAwO1xuICBmb3VuZCA9IGZhbHNlO1xuICBpZiAod2lkdGggPiB0aGlzLl9uQ29scykge1xuICAgIHRocm93IG5ldyBFcnJvcignTGF5b3V0IG1hdHJpeCBpcyB0b28gc21hbGwgdG8gZml0IGFueSByZWN0YW5nbGUgd2lkdGggd2lkdGggJyArIHdpZHRoKTtcbiAgfVxuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLl9maW5kTmV4dEZyZWVQb2ludChpKyspO1xuXG4gICAgaWYgKHRoaXMuX2NoZWNrSWZQb2ludEZpdHNSZWN0KHBvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KSkge1xuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcG9zaXRpb247XG59O1xuXG4vKipcbiAqIEFkZCBhIHJlY3RhbmdsZSB0byBtYXRyaXhcbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICogQHJldHVybiB7TWFzb25yeUxheW91dFBvaW50fVxuICovXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5hZGRSZWN0ID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uRm9yUmVjdCh3aWR0aCwgaGVpZ2h0KTtcbiAgdmFyIHkgPSBwb3NpdGlvbi55O1xuICB2YXIgeCA9IHBvc2l0aW9uLng7XG4gIHZhciBpO1xuICB2YXIgajtcblxuICBmb3IgKGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICAvLyBhZGQgbmV3IHJvdyBpZiBuZWVkZWRcbiAgICBpZiAoIXRoaXMuX21hdHJpeFt5K2ldKSB7XG4gICAgICB0aGlzLl9hZGROZXdSb3coKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgYmxvY2sgb24gd2lkdGggYW5kIGhlaWdodFxuICAgIGZvciAoaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICB0aGlzLl9tYXRyaXhbeStpXVtqK3hdID0gMTtcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBwb3NpdGlvbjtcbn07XG5cblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuZ2V0TnVtYmVyT2ZSb3dzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9tYXRyaXgubGVuZ3RoO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnlMYXlvdXQ7XG4iLCJ2YXIgTWFzb25yeUxheW91dCA9IHJlcXVpcmUoJy4vbGliL2xheW91dCcpO1xuXG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgY29sdW1uV2lkdGg6IDEwMCxcbiAgcm93SGVpZ2h0OiAxMDAsXG4gIGd1dHRlclNpemU6IDEwLFxufTtcblxuZnVuY3Rpb24gZXh0ZW5kKG8xLCBvMikge1xuICBmb3IgKHZhciBrIGluIG8yKSB7XG4gICAgaWYgKG8yLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICBvMVtrXSA9IG8yW2tdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbzE7XG59XG5cbmZ1bmN0aW9uIE1hc29ucnkoZWxlbWVudElELCBvcHRzKSB7XG4gIHRoaXMudmlld3BvcnRJRCA9IGVsZW1lbnRJRDtcblx0dGhpcy52aWV3cG9ydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJRCk7XG5cbiAgdGhpcy5vcHRpb25zID0ge307XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0aGlzLm9wdGlvbnMsIGRlZmF1bHRPcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRoaXMub3B0aW9ucywgb3B0cyk7XG5cbiAgdGhpcy5yZUxheW91dCgpO1xufVxuXG5cblxuTWFzb25yeS5wcm90b3R5cGUuZmlsdGVySXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5maWx0ZXJlZEl0ZW1zID0gW107XG5cbiAgdmFyIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyICRpdGVtID0gdGhpcy5pdGVtc1tpXTtcbiAgICAvLyBUT0RPXG4gICAgLy8gdG9nZ2xlIFwiaGlkZGVuXCIgY2xhc3NlcyB0byAkaXRlbVxuICAgIC8vIGFkZCB2aXNzaWJsZSBgdGhpcy5maWx0ZXJlZEl0ZW1zYFxuICAgIGlmICh0cnVlKSB7XG4gICAgICB0aGlzLmZpbHRlcmVkSXRlbXMucHVzaCgkaXRlbSk7XG4gICAgfVxuICB9XG59O1xuXG5cbk1hc29ucnkucHJvdG90eXBlLnNvcnRJdGVtcyA9IGZ1bmN0aW9uKCkge1xuXG4gIC8vIFRPRE9cbiAgLy8gQ2hhbmdlIHRoZSBvcmRlciBvZiBgdGhpcy52aWV3cG9ydC5jaGlsZHJlbmBzIGluIHRoZSBET01cbiAgLy8gb25seSBjYXJlIGFib3V0IHBvc2l0aW9uIG9mIGB0aGlzLmZpbHRlcmVkSXRlbXNgXG5cbn07XG5cblxuTWFzb25yeS5wcm90b3R5cGUuc2V0SXRlbVBvc2l0aW9uID0gZnVuY3Rpb24oJGl0ZW0sIHgsIHkpIHtcbiAgeCArPSAncHgnO1xuICB5ICs9ICdweCc7XG5cbiAgdmFyIGlzRmlyc3RUaW1lID0gKCRpdGVtLnN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnKTsgLy8gVE9ETyBiZXR0ZXIgY2hlY2tcbiAgaWYgKGlzRmlyc3RUaW1lKSB7XG4gICAgJGl0ZW0uc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuXG4gICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGFuaW1hdGUgaW4gb24gcmVuZGVyXG4gICAgLy8gVE9ETyBzaG91bGQgcHJvYmFibHkgYmUgcmUtd3JpdHRlbiBvbmNlIHdlIGdldCBpbnRvIGFkZGluZ1xuICAgICRpdGVtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdmFyIHJlcGFpbnQgPSAkaXRlbS5vZmZzZXRIZWlnaHQ7XG4gICAgJGl0ZW0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gIH1cblxuICAvLyBUT0RPIGJlbG93LCBjaGVjayBmb3IgdHJhbnNsYXRlM2Qgc3VwcG9ydCArIHZlbmRvciBwcmVmaXhcbiAgaWYgKHRydWUpIHtcbiAgICAkaXRlbS5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyt4KycsJyt5KycsMCknO1xuICB9IGVsc2Uge1xuICAgICRpdGVtLnN0eWxlLmxlZnQgPSB4O1xuICAgICRpdGVtLnN0eWxlLnRvcCA9IHk7XG4gIH1cbn07XG5cbk1hc29ucnkucHJvdG90eXBlLnBvc2l0aW9uSXRlbVRvUG9pbnQgPSBmdW5jdGlvbigkaXRlbSwgcG9pbnQpIHtcbiAgdmFyIHggPSBwb2ludC54ICogdGhpcy5vcHRpb25zLmNvbHVtbldpZHRoO1xuICB2YXIgeSA9IHBvaW50LnkgKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0O1xuXG4gIHggKz0gKHRoaXMub3B0aW9ucy5ndXR0ZXJTaXplICogcG9pbnQueCk7XG4gIHkgKz0gKHRoaXMub3B0aW9ucy5ndXR0ZXJTaXplICogcG9pbnQueSk7XG5cblxuICB0aGlzLnNldEl0ZW1Qb3NpdGlvbigkaXRlbSwgeCwgeSk7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5nZXRJdGVtTGF5b3V0U3BhbiA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIC8vIFRPRE9cbiAgLy8gbW92ZSBndXR0ZXIgbWF0aCBpbnRvIE1hc29ucnlMYXlvdXQgY29tcG9uZW50L3N1YmNsYXNzP1xuICAvLyBtYWtlIE1hc29ucnlMYXlvdXRTcGFuIGZvciB0aGlzIG9iamVjdD9cblxuICAvLyBob3cgbWFueSBjb2wvcm93cyBkb2VzIHRoaXMgaXRlbSBvY2N1cHlcbiAgdmFyIGl0ZW1Db2xTcGFuID0gJGl0ZW0ub2Zmc2V0V2lkdGggIC8gdGhpcy5vcHRpb25zLmNvbHVtbldpZHRoO1xuICB2YXIgaXRlbVJvd1NwYW4gPSAkaXRlbS5vZmZzZXRIZWlnaHQgLyB0aGlzLm9wdGlvbnMucm93SGVpZ2h0O1xuXG4gIC8vIGRvbid0IGluY2x1ZGUgdGhlIGd1dHRlciBpbiB0aGUgY2FsY3VsYXRpb25cbiAgaXRlbUNvbFNwYW4gLT0gKHRoaXMub3B0aW9ucy5ndXR0ZXJTaXplL3RoaXMub3B0aW9ucy5jb2x1bW5XaWR0aCkgKiBNYXRoLmZsb29yKGl0ZW1Db2xTcGFuIC0gMSk7XG4gIGl0ZW1Sb3dTcGFuIC09ICh0aGlzLm9wdGlvbnMuZ3V0dGVyU2l6ZS90aGlzLm9wdGlvbnMucm93SGVpZ2h0KSAqIE1hdGguZmxvb3IoaXRlbVJvd1NwYW4gLSAxKTtcblxuICAvLyByb3VuZCB1cFxuICBpdGVtQ29sU3BhbiA9IE1hdGguY2VpbChpdGVtQ29sU3Bhbik7XG4gIGl0ZW1Sb3dTcGFuID0gTWF0aC5jZWlsKGl0ZW1Sb3dTcGFuKTtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBpdGVtQ29sU3BhbixcbiAgICBoZWlnaHQ6IGl0ZW1Sb3dTcGFuXG4gIH07XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5wb3NpdGlvbkl0ZW1zID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZW4gPSB0aGlzLml0ZW1zLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciAkaXRlbSA9IHRoaXMuZmlsdGVyZWRJdGVtc1tpXTtcblxuICAgIHZhciBzcGFuID0gdGhpcy5nZXRJdGVtTGF5b3V0U3BhbigkaXRlbSk7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5sYXlvdXQuYWRkUmVjdChzcGFuLndpZHRoLCBzcGFuLmhlaWdodCk7XG5cbiAgICB0aGlzLnBvc2l0aW9uSXRlbVRvUG9pbnQoJGl0ZW0sIHBvc2l0aW9uKTtcbiAgfVxufTtcblxuTWFzb25yeS5wcm90b3R5cGUuY2FsY3VsYXRlTnVtYmVyT2ZDb2x1bW5zID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHZpZXdQb3J0RXh0cmFHdXR0ZXIgPSAodGhpcy52aWV3cG9ydC5vZmZzZXRXaWR0aCArIHRoaXMub3B0aW9ucy5ndXR0ZXJTaXplKTtcbiAgdmFyIGNvbHVtbldpZHRoV2l0aEd1dHRlciA9ICh0aGlzLm9wdGlvbnMuY29sdW1uV2lkdGggKyB0aGlzLm9wdGlvbnMuZ3V0dGVyU2l6ZSk7XG5cbiAgdmFyIG5Db2xzID0gdmlld1BvcnRFeHRyYUd1dHRlciAvIGNvbHVtbldpZHRoV2l0aEd1dHRlcjtcblxuXG4gIHRoaXMubnVtYmVyT2ZDb2x1bW5zID0gTWF0aC5mbG9vcihuQ29scyk7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5yZXNpemVWaWV3UG9ydCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbnVtYmVyT2ZSb3dzID0gdGhpcy5sYXlvdXQuZ2V0TnVtYmVyT2ZSb3dzKCk7XG5cbiAgLy8gYXV0by1hZGp1c3RzIG9uIHdpZHRoXG4gIC8vIHZhciB3aWR0aCA9ICh0aGlzLm51bWJlck9mQ29sdW1ucyAqIHRoaXMub3B0aW9ucy5jb2x1bW5XaWR0aCkgKyAodGhpcy5udW1iZXJPZkNvbHVtbnMtMSkgKiB0aGlzLm9wdGlvbnMuZ3V0dGVyU2l6ZTtcbiAgdmFyIGhlaWdodCA9IChudW1iZXJPZlJvd3MgKiB0aGlzLm9wdGlvbnMucm93SGVpZ2h0KSArIChudW1iZXJPZlJvd3MtMSkgKiB0aGlzLm9wdGlvbnMuZ3V0dGVyU2l6ZTtcblxuICB0aGlzLnZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG59O1xuXG5NYXNvbnJ5LnByb3RvdHlwZS5yZUxheW91dCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLml0ZW1zID0gW10uc2xpY2UuY2FsbCh0aGlzLnZpZXdwb3J0LmNoaWxkcmVuKTtcblxuICB0aGlzLmZpbHRlckl0ZW1zKCk7XG4gIHRoaXMuc29ydEl0ZW1zKCk7XG5cbiAgdGhpcy5jYWxjdWxhdGVOdW1iZXJPZkNvbHVtbnMoKTtcblxuICB0aGlzLmxheW91dCA9IG5ldyBNYXNvbnJ5TGF5b3V0KHRoaXMubnVtYmVyT2ZDb2x1bW5zKTtcblxuICB0aGlzLnBvc2l0aW9uSXRlbXMoKTtcblxuICB0aGlzLnJlc2l6ZVZpZXdQb3J0KCk7XG5cbiAgLy8gVE9ET1xuICAvLyBzb21lIGtpbmQgb2YgdHJpZ2dlciB3aGVuIHJlTGF5b3V0IGlzIGRvbmU/XG4gIC8vIGNvdWxkIGJlIHVzZWQgdG8gY2xlYW4gdXAgdW4tdXNlZCBpdGVtcyBmcm9tIHRoZSBET00gdHJlZSBldGNcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFzb25yeTsiXX0=
(3)
});
