import { immerable } from "immer"

const DEFAULT_COLOUR = '#ffffff'

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Velocity
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} BoundingBox
 * @property {Point} topLeft
 * @property {Point} bottomRight
 */

export class Entity {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {Array<Entity>} components
   * @param {boolean} isStatic
   * @param {number} angle
   * @param {('container' |'shape' | 'text')} type
   */
  constructor(name, x, y, components, isStatic, type = 'container', angle = 0) {
    this[immerable] = true

    this.type = type
    this.name = name
    this.x = x
    this.y = y
    this.z = 0
    this.components = components
    this.angle = angle
    this.velocity = { x: 0, y: 0 }
    this.isStatic = isStatic
    this.isRoot = true

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

export class Shape extends Entity {
  /**
   * @param {string} classification
   * @param {string} colour
   */
  constructor(classification, name, x, y, colour, components, isStatic, angle = 0) {
    super(name, x, y, components, isStatic, 'shape', angle)
    this.classification = classification
    this.colour = colour
  }
}

export class Circle extends Shape {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {string} colour
   */
  constructor(
    name, x, y, radius, colour = DEFAULT_COLOUR, components = [], isStatic = false
  ) {
    super('circle', name, x, y, colour, components, isStatic)
    this.radius = radius
  }
}

export class Rectangle extends Shape {
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
    angle = 0,
    isStatic = false
  ) {
    super('rectangle', name, x, y, colour, components, isStatic, angle)
    this.width = width
    this.height = height
  }
}
