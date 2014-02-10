// Setup chai
var chai = require('chai');
global.expect = chai.expect;
chai.should();
chai.use(require('sinon-chai'));

// Setup sinon
global.sinon = require('sinon');



global.Masonry = require('../mazon');
global.MasonryLayout = require('../lib/layout');
global.MasonryLayoutPoint = require('../lib/layout-point');



