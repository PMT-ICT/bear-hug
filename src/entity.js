const { Shape } = require('./shape')

class Entity {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {Array<Shape>} shapes
   */
  constructor(name, x, y, shapes) {
    this.name = name
    this.x = x
    this.y = y
    this.shapes = shapes
  }
}

EntityEvent = {
  ON_CLICK: 1,
}

module.exports = { Entity, EntityEvent }