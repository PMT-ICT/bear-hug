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

/**
 * @typedef {Object} EntityOptions
 * @property {Array<Entity>} components Child entities the entity is composed of.
 * @property {boolean} isStatic         Whether or not the entity is subject to gravity.
 * @property {number} angle             Angle of the entity.
 * @property {number} timeToLive        Time this entity has to live, in ms.
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
  constructor(name, x, y, type, options = {}) {
    this[immerable] = true

    this.type = type
    this.name = name
    this.x = x
    this.y = y
    this.z = 0
    this.velocity = { x: 0, y: 0 }
    this.isRoot = true

    const {
      angle = 0,
      components = [],
      isStatic = false,
      timeToLive = Infinity
    } = options
    this.angle = angle
    this.components = components
    this.isStatic = isStatic
    this.timeToLive = timeToLive

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

export class Container extends Entity {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {Array<Entity>} components
   * @param {EntityOptions} options
   */
  constructor(name, x, y, options = {}) {
    super(name, x, y, 'container', options)
  }
}

/**
 * @typedef {Object} ShapeOptions
 * @property {string} colour
 */

export class Shape extends Entity {
  /**
   * @param {string} classification
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {EntityOptions & ShapeOptions} options
   */
  constructor(classification, name, x, y, options = {}) {
    super(name, x, y, 'shape', options)
    this.classification = classification
    this.colour = options.colour || DEFAULT_COLOUR
  }
}

export class Circle extends Shape {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {EntityOptions & ShapeOptions} options
   */
  constructor(name, x, y, radius, options = {}) {
    super('circle', name, x, y, options)
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
   * @param {EntityOptions & ShapeOptions}
   */
  constructor(name, x, y, width, height, options = {}) {
    super('rectangle', name, x, y, options)
    this.width = width
    this.height = height
  }
}
