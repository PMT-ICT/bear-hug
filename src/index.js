const upUpAndAway = require('./game')
const entity = require('./entity')
const colour = require('./colour')
const Phaser = require('phaser')

const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
}

module.exports = {
  ...entity,
  colour,
  upUpAndAway,
  keyboard: Phaser.Input.Keyboard.KeyCodes,
  mouse: MouseButton
}
