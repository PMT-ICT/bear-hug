const DEFAULT_COLOUR = '#ffffff'

class Shape {
  /**
   * @param {string} type
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {string} colour
   */
  constructor(type, name, x, y, colour) {
    this.type = type
    this.name = name
    this.x = x
    this.y = y
    this.colour = colour
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
  constructor(name, x, y, radius, colour = DEFAULT_COLOUR) {
    super('circle', name, x, y, colour)
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
   * @param {string} colour
   */
  constructor(name, x, y, width, height, colour = DEFAULT_COLOUR) {
    super('rectangle', name, x, y, colour)
    this.width = width
    this.height = height
  }
}


module.exports = { Circle, Rectangle, Shape }
