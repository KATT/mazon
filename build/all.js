(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL3NyYy9mYWtlXzIwYjZjMTdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBNYXNvbnJ5TGF5b3V0O1xuXG5cbmZ1bmN0aW9uIE1hc29ucnlMYXlvdXQoX25Db2xzKSB7XG4gIHRoaXMuX25Db2xzID0gX25Db2xzO1xuICB0aGlzLl9tYXRyaXggPSBbXTtcbn1cblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuX2ZpbmROZXh0RnJlZVNwYWNlID0gZnVuY3Rpb24oc2tpcCkge1xuICB2YXIgY29scywgY29vcmRpbmF0ZSwgaSwgaXNUYWtlbiwgeCwgeSwgX21hdHJpeDtcbiAgaWYgKCFza2lwKSB7XG4gICAgc2tpcCA9IDA7XG4gIH1cbiAgY29vcmRpbmF0ZSA9IG51bGw7XG4gIGkgPSAwO1xuICBfbWF0cml4ID0gdGhpcy5fbWF0cml4O1xuICBjb25zb2xlLmxvZyhfbWF0cml4KVxuICBmb3IgKHkgaW4gX21hdHJpeCkge1xuICAgIGNvbHMgPSBfbWF0cml4W3ldO1xuICAgIGZvciAoeCBpbiBjb2xzKSB7XG4gICAgICBpc1Rha2VuID0gY29sc1t4XTtcbiAgICAgIGlmICghaXNUYWtlbikge1xuICAgICAgICBpZiAoc2tpcCA8PSBpKyspIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogTnVtYmVyKHgpLFxuICAgICAgICAgICAgeTogTnVtYmVyKHkpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyBkaWRuJ3QgZmluZCBhbnkgZnJlZSBzcGFjZSwgbmV3IGxpbmUgbmVlZGVkXG4gIHJldHVybiB7XG4gICAgeDogMCxcbiAgICB5OiBfbWF0cml4Lmxlbmd0aFxuICB9O1xufTtcblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuX2NoZWNrSWZTcGFjZUZpdHNCbG9jayA9IGZ1bmN0aW9uKGNvb3JkaW5hdGUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGR4LCBpLCB4LCB5O1xuICBjb25zb2xlLmxvZygnX2NoZWNrSWZTcGFjZUZpdHNCbG9jaycsIGNvb3JkaW5hdGUsIHdpZHRoLCBoZWlnaHQpO1xuXG4gIHggPSBjb29yZGluYXRlLng7XG4gIHkgPSBjb29yZGluYXRlLnk7XG4gIGlmICghdGhpcy5fbWF0cml4W3ldKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLy8gVE9ETyBzZWUgaWYgaXQgZml0cyBvbiB3aWR0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICAvLyBzdGVwIHRocm91Z2ggd2lkdGgsIHNlZSBpZiB0YWtlblxuICAgIGlmICh0aGlzLl9tYXRyaXhbeV1beCtpXSA9PT0gMSB8fCB4K2kgPj0gdGhpcy5fbkNvbHMpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cblxuICAvLyBUT0RPIHNlZSBpZiBpdFxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuZ2V0RW1wdHlTcGFjZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGNvb3JkaW5hdGUsIGZvdW5kLCBpO1xuICBjb25zb2xlLmxvZygnZ2V0RW1wdHlTcGFjZScpO1xuICBpID0gMDtcbiAgZm91bmQgPSBmYWxzZTtcbiAgaWYgKHdpZHRoID4gdGhpcy5fbkNvbHMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3I7XG4gIH1cbiAgd2hpbGUgKHRydWUpIHtcbiAgICAvLyBeIHRoZXJlIG11c3QgYmUgZnJlZSFcblxuICAgIGNvb3JkaW5hdGUgPSB0aGlzLl9maW5kTmV4dEZyZWVTcGFjZShpKyspO1xuXG4gICAgaWYgKCFjb29yZGluYXRlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2NoZWNrSWZTcGFjZUZpdHNCbG9jayhjb29yZGluYXRlLCB3aWR0aCwgaGVpZ2h0KSkge1xuICAgICAgcmV0dXJuIGNvb3JkaW5hdGU7XG4gICAgfVxuICB9XG59O1xuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5hZGRCbG9jayA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIGNvb3JkaW5hdGUgPSB0aGlzLmdldEVtcHR5U3BhY2Uod2lkdGgsIGhlaWdodCk7XG4gIHZhciB5ID0gY29vcmRpbmF0ZS55O1xuICB2YXIgeCA9IGNvb3JkaW5hdGUueDtcbiAgdmFyIGk7XG4gIC8vIGlmIHJvdyBkb2Vzbid0IGV4aXN0LCBhZGQgcm93XG4gIGlmICghdGhpcy5fbWF0cml4W3ldKSB7XG4gICAgdGhpcy5fbWF0cml4W3ldID0gbmV3IEFycmF5KHRoaXMuX25Db2xzKTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fbkNvbHM7IGkrKykge1xuICAgICAgdGhpcy5fbWF0cml4W3ldW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyBhZGQgYmxvY2sgb24gd2lkdGhcbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICB0aGlzLl9tYXRyaXhbeV1baSt4XSA9IDE7XG4gIH07XG5cbiAgcmV0dXJuIGNvb3JkaW5hdGU7XG59O1xuXG5cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLnNldE1hdHJpeCA9IGZ1bmN0aW9uKG1hdHJpeCkge1xuICB0aGlzLl9tYXRyaXggPSBtYXRyaXg7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBNYXNvbnJ5TGF5b3V0O1xuIl19

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var layout = require('./layout');


layout();
},{"./layout":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYWpheC9kZXYvbWF6b24vbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL3NyYy9mYWtlX2E1MGQ5MThmLmpzIiwiL1VzZXJzL2FqYXgvZGV2L21hem9uL3NyYy9sYXlvdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGxheW91dCA9IHJlcXVpcmUoJy4vbGF5b3V0Jyk7XG5cblxubGF5b3V0KCk7IiwidmFyIE1hc29ucnlMYXlvdXQ7XG5cblxuZnVuY3Rpb24gTWFzb25yeUxheW91dChfbkNvbHMpIHtcbiAgdGhpcy5fbkNvbHMgPSBfbkNvbHM7XG4gIHRoaXMuX21hdHJpeCA9IFtdO1xufVxuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fZmluZE5leHRGcmVlU3BhY2UgPSBmdW5jdGlvbihza2lwKSB7XG4gIHZhciBjb2xzLCBjb29yZGluYXRlLCBpLCBpc1Rha2VuLCB4LCB5LCBfbWF0cml4O1xuICBpZiAoIXNraXApIHtcbiAgICBza2lwID0gMDtcbiAgfVxuICBjb29yZGluYXRlID0gbnVsbDtcbiAgaSA9IDA7XG4gIF9tYXRyaXggPSB0aGlzLl9tYXRyaXg7XG4gIGNvbnNvbGUubG9nKF9tYXRyaXgpXG4gIGZvciAoeSBpbiBfbWF0cml4KSB7XG4gICAgY29scyA9IF9tYXRyaXhbeV07XG4gICAgZm9yICh4IGluIGNvbHMpIHtcbiAgICAgIGlzVGFrZW4gPSBjb2xzW3hdO1xuICAgICAgaWYgKCFpc1Rha2VuKSB7XG4gICAgICAgIGlmIChza2lwIDw9IGkrKykge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBOdW1iZXIoeCksXG4gICAgICAgICAgICB5OiBOdW1iZXIoeSlcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIGRpZG4ndCBmaW5kIGFueSBmcmVlIHNwYWNlLCBuZXcgbGluZSBuZWVkZWRcbiAgcmV0dXJuIHtcbiAgICB4OiAwLFxuICAgIHk6IF9tYXRyaXgubGVuZ3RoXG4gIH07XG59O1xuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5fY2hlY2tJZlNwYWNlRml0c0Jsb2NrID0gZnVuY3Rpb24oY29vcmRpbmF0ZSwgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgZHgsIGksIHgsIHk7XG4gIGNvbnNvbGUubG9nKCdfY2hlY2tJZlNwYWNlRml0c0Jsb2NrJywgY29vcmRpbmF0ZSwgd2lkdGgsIGhlaWdodCk7XG5cbiAgeCA9IGNvb3JkaW5hdGUueDtcbiAgeSA9IGNvb3JkaW5hdGUueTtcbiAgaWYgKCF0aGlzLl9tYXRyaXhbeV0pIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBUT0RPIHNlZSBpZiBpdCBmaXRzIG9uIHdpZHRoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgIC8vIHN0ZXAgdGhyb3VnaCB3aWR0aCwgc2VlIGlmIHRha2VuXG4gICAgaWYgKHRoaXMuX21hdHJpeFt5XVt4K2ldID09PSAxIHx8IHgraSA+PSB0aGlzLl9uQ29scykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuXG4gIC8vIFRPRE8gc2VlIGlmIGl0XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5NYXNvbnJ5TGF5b3V0LnByb3RvdHlwZS5nZXRFbXB0eVNwYWNlID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgY29vcmRpbmF0ZSwgZm91bmQsIGk7XG4gIGNvbnNvbGUubG9nKCdnZXRFbXB0eVNwYWNlJyk7XG4gIGkgPSAwO1xuICBmb3VuZCA9IGZhbHNlO1xuICBpZiAod2lkdGggPiB0aGlzLl9uQ29scykge1xuICAgIHRocm93IG5ldyBFcnJvcjtcbiAgfVxuICB3aGlsZSAodHJ1ZSkge1xuICAgIC8vIF4gdGhlcmUgbXVzdCBiZSBmcmVlIVxuXG4gICAgY29vcmRpbmF0ZSA9IHRoaXMuX2ZpbmROZXh0RnJlZVNwYWNlKGkrKyk7XG5cbiAgICBpZiAoIWNvb3JkaW5hdGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fY2hlY2tJZlNwYWNlRml0c0Jsb2NrKGNvb3JkaW5hdGUsIHdpZHRoLCBoZWlnaHQpKSB7XG4gICAgICByZXR1cm4gY29vcmRpbmF0ZTtcbiAgICB9XG4gIH1cbn07XG5cbk1hc29ucnlMYXlvdXQucHJvdG90eXBlLmFkZEJsb2NrID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICB2YXIgY29vcmRpbmF0ZSA9IHRoaXMuZ2V0RW1wdHlTcGFjZSh3aWR0aCwgaGVpZ2h0KTtcbiAgdmFyIHkgPSBjb29yZGluYXRlLnk7XG4gIHZhciB4ID0gY29vcmRpbmF0ZS54O1xuICB2YXIgaTtcbiAgLy8gaWYgcm93IGRvZXNuJ3QgZXhpc3QsIGFkZCByb3dcbiAgaWYgKCF0aGlzLl9tYXRyaXhbeV0pIHtcbiAgICB0aGlzLl9tYXRyaXhbeV0gPSBuZXcgQXJyYXkodGhpcy5fbkNvbHMpO1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9uQ29sczsgaSsrKSB7XG4gICAgICB0aGlzLl9tYXRyaXhbeV1baV0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBibG9jayBvbiB3aWR0aFxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgIHRoaXMuX21hdHJpeFt5XVtpK3hdID0gMTtcbiAgfTtcblxuICByZXR1cm4gY29vcmRpbmF0ZTtcbn07XG5cblxuTWFzb25yeUxheW91dC5wcm90b3R5cGUuc2V0TWF0cml4ID0gZnVuY3Rpb24obWF0cml4KSB7XG4gIHRoaXMuX21hdHJpeCA9IG1hdHJpeDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hc29ucnlMYXlvdXQ7XG4iXX0=
