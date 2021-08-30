const DEFAULT_COLOUR = '#ffffff'

const circle = (name, x, y, radius, colour = DEFAULT_COLOUR) => ({
  name,
  x,
  y,
  radius,
  colour,
  type: 'circle',
})

const rectangle = (name, x, y, width, height, colour = DEFAULT_COLOUR) => ({
  name,
  x,
  y,
  width,
  height,
  colour,
  type: 'rectangle'
})

module.exports = { circle, rectangle }