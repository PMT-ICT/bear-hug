const Phaser = require('phaser')
const logoImg = require('./assets/logo.png')

const rabbitDown = require('./assets/Rabbit_Down.png')
const rabbitUp = require('./assets/Rabbit_Up.png')
const rabbitLeft = require('./assets/Rabbit_Left.png')
const rabbitRight = require('./assets/Rabbit_Right.png')
const rabbitDead = require('./assets/Rabbit_Dead.png')

const createScene = fn => function() {
  const bunny = this.add.image(400, 150, 'rabbitDown')
  
  console.log(fn())
}

class MyGame extends Phaser.Scene {
  constructor(fn) {
    super();

    this.create = createScene(fn)
  }

  preload() {
    this.load.image('logo', logoImg);
    this.load.image('rabbitDown', rabbitDown);
    this.load.image('rabbitUp', rabbitUp);
    this.load.image('rabbitLeft', rabbitLeft);
    this.load.image('rabbitRight', rabbitRight);
  }
}



module.exports = {
  launch: fn => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: 800,
      height: 600,
      scene: new MyGame(fn)
    };

    global.game = new Phaser.Game(config);
  }
}