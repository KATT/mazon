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