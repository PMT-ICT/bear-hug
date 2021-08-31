const upUpAndAway = require('./game')
const entity = require('./entity')
const shape = require('./shape')

const MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
}

module.exports = {
  ...shape,
  ...entity,
  upUpAndAway,
  keyboard: Phaser.Input.Keyboard.KeyCodes,
  mouse: MouseButton
}
