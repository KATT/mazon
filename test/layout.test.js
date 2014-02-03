'use strict';

describe('MasonryLayout', function() {
  var layout;
  beforeEach(function() {

    layout = new MasonryLayout(4);

  });
  it('should find first empty space when empty', function() {
    expect(layout.getEmptySpace(1,1)).to.deep.equal({x:0, y:0});
  });

  it('should add a block', function() {
    expect(layout.addBlock(1, 1)).to.deep.equal({x:0, y:0});
    expect(layout.getEmptySpace(1, 1)).to.deep.equal({x:1, y:0});
  });
  it('should multiple blocks', function() {
    expect(layout.addBlock(1, 1)).to.deep.equal({x:0, y:0});
    expect(layout.addBlock(1, 1)).to.deep.equal({x:1, y:0});
    expect(layout.getEmptySpace(1, 1)).to.deep.equal({x:2, y:0});
  });


  it('should add blocks over multiple lines', function() {
    layout.addBlock(1, 1);
    layout.addBlock(1, 1);
    layout.addBlock(1, 1);
    layout.addBlock(1, 1);
    layout.addBlock(1, 1);
    expect(layout.getEmptySpace(1, 1)).to.deep.equal({x:1, y:1});
  });

  it('should add 2 wide blocks', function() {
    layout.addBlock(2, 1);
    expect(layout.getEmptySpace(1, 1)).to.deep.equal({x:2, y:0});
  });


  it('should add wider blocks on new line if they don\'t fit', function() {
    layout.addBlock(3, 1);

    expect(layout.addBlock(2, 1)).to.deep.equal({x:0,y:1});
  });


  it('should find empty slots in matrix and add new pieces there', function() {
    layout.setMatrix([
      [1, 0, 0, 1]
    ]);

    expect(layout.addBlock(3, 1)).to.deep.equal({x:0,y:1});
    expect(layout.addBlock(2, 1)).to.deep.equal({x:1,y:0});
  });




  it('should throw error when trying to add too wide pieces', function() {
    expect(layout.addBlock(5, 1)).to.throw(Error);
  });

});
