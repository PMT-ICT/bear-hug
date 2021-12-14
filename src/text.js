import { Entity } from './entity'
import { Colour } from './colour'

export const Font = {
  MINECRAFT: 'Minecraft',
  EDIT_UNDO_LINE: 'Edit Undo Line',
  MONSTER_FRIEND_FORE: 'Monster Friend Fore',
  GOTHIC_PIXELS: 'Gothic Pixels',
  GYPSY_CURSE: 'Gypsy Curse'
}

const isValidFont = font => Object.values(Font).includes(font)

/**
 * @typedef {Object} TextOptions
 * @property {number} angle 
 * @property {string} colour
 * @property {Array<Entity>} components
 * @property {string} fontFamily
 * @property {string} fontSize
 * @property {boolean} isStatic
 * @property {number} x
 * @property {number} y
 */

export class Text extends Entity {
  /**
   * @param {string} name
   * @param {string} content
   * @param {TextOptions} options
   */
  constructor(name, content, options = {}) {
    const {
      angle = 0,
      colour = Colour.BLACK,
      components = [],
      fontFamily = Font.MINECRAFT,
      fontSize = 24,
      isStatic = true,
      x = 0,
      y = 0,
    } = options

    super(name, x, y, components, isStatic, 'text', angle)

    if (fontFamily && !isValidFont(fontFamily)) {
      const validFonts = Object.values(Font).join(', ')
      throw Error(`No font family ${fontFamily} found. Options are: ${validFonts}`)
    }

    this.content = content
    this.fontFamily = fontFamily
    this.fontSize = fontSize
    this.colour = colour
    this.isStatic = isStatic
  }
}
