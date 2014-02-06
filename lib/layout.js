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
