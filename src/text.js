import { Entity, EntityOptions } from './entity'
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
 * @property {string} colour
 * @property {string} fontFamily
 * @property {string} fontSize
 */

export class Text extends Entity {
  /**
   * @param {string} name
   * @param {number} x
   * @param {number} y
   * @param {string} content
   * @param {EntityOptions & TextOptions} options
   */
  constructor(name, x, y, content, options = {}) {
    super(name, x, y, 'text', options)
    
    const {
      colour = Colour.BLACK,
      fontFamily = Font.MINECRAFT,
      fontSize = 24,
    } = options

    if (fontFamily && !isValidFont(fontFamily)) {
      const validFonts = Object.values(Font).join(', ')
      throw Error(`No font family ${fontFamily} found. Options are: ${validFonts}`)
    }

    this.content = content
    this.fontFamily = fontFamily
    this.fontSize = fontSize
    this.colour = colour
  }
}
