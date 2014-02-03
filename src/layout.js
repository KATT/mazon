var MasonryLayout;


function MasonryLayout(_nCols) {
  this._nCols = _nCols;
  this._matrix = [];
}

MasonryLayout.prototype._findNextFreeSpace = function(skip) {
  var cols, coordinate, i, isTaken, x, y, _matrix;
  if (!skip) {
    skip = 0;
  }
  coordinate = null;
  i = 0;
  _matrix = this._matrix;
  console.log(_matrix)
  for (y in _matrix) {
    cols = _matrix[y];
    for (x in cols) {
      isTaken = cols[x];
      if (!isTaken) {
        if (skip <= i++) {
          return {
            x: Number(x),
            y: Number(y)
          };
        }
      }
    }
  }
  // didn't find any free space, new line needed
  return {
    x: 0,
    y: _matrix.length
  };
};

MasonryLayout.prototype._checkIfSpaceFitsBlock = function(coordinate, width, height) {
  var dx, i, x, y;
  console.log('_checkIfSpaceFitsBlock', coordinate, width, height);

  x = coordinate.x;
  y = coordinate.y;
  if (!this._matrix[y]) {
    return true;
  }
  // TODO see if it fits on width
  for (var i = 0; i < width; i++) {
    // step through width, see if taken
    if (this._matrix[y][x+i] === 1 || x+i >= this._nCols) {
      return false;
    }
  };


  // TODO see if it

  return true;
};

MasonryLayout.prototype.getEmptySpace = function(width, height) {
  var coordinate, found, i;
  console.log('getEmptySpace');
  i = 0;
  found = false;
  if (width > this._nCols) {
    throw new Error;
  }
  while (true) {
    // ^ there must be free!

    coordinate = this._findNextFreeSpace(i++);

    if (!coordinate) {
      return null;
    }
    if (this._checkIfSpaceFitsBlock(coordinate, width, height)) {
      return coordinate;
    }
  }
};

MasonryLayout.prototype.addBlock = function(width, height) {
  var coordinate = this.getEmptySpace(width, height);
  var y = coordinate.y;
  var x = coordinate.x;
  var i;
  // if row doesn't exist, add row
  if (!this._matrix[y]) {
    this._matrix[y] = new Array(this._nCols);
    for (i = 0; i < this._nCols; i++) {
      this._matrix[y][i] = 0;
    }
  }

  // add block on width
  for (i = 0; i < width; i++) {
    this._matrix[y][i+x] = 1;
  };

  return coordinate;
};


MasonryLayout.prototype.setMatrix = function(matrix) {
  this._matrix = matrix;

  return this;
};



module.exports = MasonryLayout;
