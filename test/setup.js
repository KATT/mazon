// Setup chai
var chai = require('chai');
global.expect = chai.expect;
chai.should();
chai.use(require('sinon-chai'));

// Setup sinon
global.sinon = require('sinon');


global.Masonry = require('../src/masonry');
global.MasonryLayout = require('../src/layout');
global.MasonryLayoutPoint = require('../src/layout-point');

