const Phaser = require('phaser')

const BearHug = require('./game')
const entity = require('./entity')
const shape = require('./shape')

// const createScene = fn => function() {
//   const bunny = this.add.image(400, 150, 'rabbitDown')
  
//   console.log(fn())
// }

module.exports = {
  entity,
  shape,

  upUpAndAway: fns => {
    const { setup, render } = fns

    const config = { 
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: 800,
      height: 600,
      scene: new BearHug(setup, render)
    };

    global.game = new Phaser.Game(config);
  }
}
