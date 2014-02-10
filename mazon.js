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