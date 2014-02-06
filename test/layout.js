'use strict';
var chai = require('chai')
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)


var Masonry = require('../mazon');
var MasonryLayout = require('../lib/layout');
var MasonryLayoutPoint = require('../lib/layout-point');



describe('MasonryLayoutPoint', function() {
  it('should create points', function() {
    expect(new MasonryLayoutPoint(0, 0)).to.deep.equal({ x: 0, y: 0 });
    expect(new MasonryLayoutPoint(1, 1)).to.deep.equal({ x: 1, y: 1 });
  });
});
describe('MasonryLayout', function() {
  var layout;
  beforeEach(function() {

    layout = new MasonryLayout(4);

  });
  it('should find first empty space when empty', function() {
    expect(layout.getPositionForRect(1,1)).to.deep.equal({x:0, y:0});
  });

  it('should add a block', function() {
    expect(layout.addRect(1, 1)).to.deep.equal({x:0, y:0});
    expect(layout.getPositionForRect(1, 1)).to.deep.equal({x:1, y:0});
  });
  it('should add multiple blocks', function() {
    expect(layout.addRect(1, 1)).to.deep.equal({x:0, y:0});
    expect(layout.addRect(1, 1)).to.deep.equal({x:1, y:0});
    expect(layout.getPositionForRect(1, 1)).to.deep.equal({x:2, y:0});
  });


  it('should add blocks over multiple lines', function() {
    layout.addRect(4, 1);

    layout.addRect(1, 1);
    expect(layout.getPositionForRect(1, 1)).to.deep.equal({x:1, y:1});
  });

  it('should add 2 wide blocks', function() {
    layout.addRect(2, 1);
    expect(layout.getPositionForRect(1, 1)).to.deep.equal({x:2, y:0});
  });


  it('should add wider blocks on new line if they don\'t fit', function() {
    layout.addRect(3, 1);

    expect(layout.addRect(2, 1)).to.deep.equal({x:0,y:1});
  });


  it('should find empty slots in matrix and add new pieces there', function() {
    // FIXME don't do this, accessing "private property"
    layout._matrix = [
      [1, 0, 0, 1]
    ]

    expect(layout.addRect(3, 1)).to.deep.equal({x:0,y:1});
    expect(layout.addRect(2, 1)).to.deep.equal({x:1,y:0});
  });

  it('should add a vertical block', function() {
    // FIXME don't do this, accessing "private property"
    layout._matrix = [
      [1, 1, 0, 1],
      [1, 1, 0, 1]
    ];
    expect(layout.addRect(1, 2)).to.deep.equal({x:2, y:0});

    // should have filled up matrix so next free position is on next line
    expect(layout.getPositionForRect(1, 1)).to.deep.equal({x:0, y:2});
  });


  it('should add a 2x2 block', function() {
    expect(layout.addRect(2, 2));
    expect(layout.addRect(1, 1));

    expect(layout._matrix).to.deep.equal([
      [1,1,1,0],
      [1,1,0,0]
    ]);
  });


  // it('should throw error when trying to add too wide pieces', function() {
  //   expect(layout.addRect(5, 1)).to.throw(new Error);
  // });

});
