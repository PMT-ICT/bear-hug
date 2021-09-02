const DEFAULT_COLOUR = '#ffffff'

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} BoundingBox
 * @property {Point} topLeft
 * @property {Point} bottomRight
 */

class Entity {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {Array<Entity>} components
   * @param {number} angle
   */
  constructor(name, x, y, components, angle = 0) {
    this.name = name
    this.x = x
    this.y = y
    this.z = 0
    this.components = components
    this.angle = angle
    this.isRoot = true
    this.isShape = false
    
    // FIXME: elegant solution possible?
    components.forEach(c => {
      c.isRoot = false
      c.incrementZ()
    })
    
  }

  incrementZ() {
    this.z = this.z + 1
    this.components.forEach(c => c.incrementZ())
  }
}

class Shape extends Entity {
  /**
   * @param {string} type
   * @param {string} colour
   */
  constructor(type, name, x, y, colour, components = [], angle = 0) {
    super(name, x, y, components, angle)
    this.type = type
    this.colour = colour
    this.isShape = true
  }
}

class Circle extends Shape {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {string} colour
   */
  constructor(
    name, x, y, radius, colour = DEFAULT_COLOUR, components = []
  ) {
    super('circle', name, x, y, colour, components)
    this.radius = radius
  }
}

class Rectangle extends Shape {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} angle
   * @param {string} colour
   */
  constructor(
    name, 
    x, 
    y, 
    width, 
    height, 
    colour = DEFAULT_COLOUR, 
    components = [],
    angle = 0
  ) {
    super('rectangle', name, x, y, colour, components, angle)
    this.width = width
    this.height = height
  }
}

module.exports = { Entity, Shape, Rectangle, Circle }