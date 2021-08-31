const Phaser = require('phaser')

const { Entity } = require('./entity')


/**
 * @typedef {Object} Scene
 * @property {string} background Background colour of the scene, as a hexadecimal string. Use a colourpicker!
 */


/**
 * @typedef {Object} GameState
 * @property {Object.<string, Entity>} entities
 * @property {Scene} scene
 */


/**
 * @callback setup
 * @returns {GameState}
 */


/**
 * @callback render
 * @param {GameState} state
 * @returns {GameState}
 */


/**
 * @callback stopWhen
 * @param {GameState} state
 * @returns {boolean}
 */


/**
 * @typedef {number} KeyCode
 */


/**
 * @callback onKeyDown
 * @param {KeyCode} key
 * @param {GameState} state
 * @returns {GameState}
 */


/**
 * @callback onKeyUp
 * @param {KeyCode} key
 * @param {GameState} state
 * @returns {GameState}
 */


/** @typedef {0 | 1 | 2} MouseButton */

/** 
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @callback onMouseDown
 * @param {MouseButton} mouseButton
 * @param {Point} coordinates
 * @param {GameState} state
 * @returns {GameState}
 */


/**
 * @callback onMouseUp
 * @param {MouseButton} mouseButton
 * @param {Point} coordinates
 * @param {GameState} state
 * @returns {GameState}
 */


/**
 * @typedef {Object} GameFunctions
 * @property {setup} setup
 * @property {render} render
 * @property {stopWhen} stopWhen
 * @property {onKeyDown} onKeyDown
 * @property {onKeyUp} onKeyUp
 * @property {onMouseDown} onMouseDown
 * @property {onMouseUp} onMouseUp
 */

const MAX_HISTORY_SIZE = 30 * 10

class BearHug extends Phaser.Scene {
  /**
   * @param {GameFunctions} functions
   */
  constructor(functions) {
    super();

    /** @type {GameState} */
    this.state = undefined

    /** @type {Array<GameState>} */
    this.history = []

    this.setup = functions.setup
    this.render = functions.render
    this.stopWhen = functions.stopWhen
    this.onKeyDown = functions.onKeyDown
    this.onKeyUp = functions.onKeyUp
    this.onMouseDown = functions.onMouseDown
    this.onMouseUp = functions.onMouseUp

    this.objects = {
      camera: undefined,
      entities: {}
    }
  }

  preload() {
    const rabbitDown = require('./assets/Rabbit_Down.png')
    this.load.image('rabbitDown', rabbitDown)

    const rabbitUp = require('./assets/Rabbit_Up.png')
    this.load.image('rabbitUp', rabbitUp)
    
    const rabbitLeft = require('./assets/Rabbit_Left.png')
    this.load.image('rabbitLeft', rabbitLeft)
    
    const rabbitRight = require('./assets/Rabbit_Right.png')
    this.load.image('rabbitRight', rabbitRight)
    
    const rabbitDead = require('./assets/Rabbit_Dead.png')
    this.load.image('rabbitDead', rabbitDead)
  }

  create() {
    this.state = this.setup()

    if (!this.state) {
      throw Error('Function "setup" did not return anything.')
    }

    this.objects.camera = this.cameras.add(0, 0, 800, 600)

    const { entities, scene } = this.state

    if (scene.background) {
      this.objects.camera.setBackgroundColor(scene.background)
    }

    if (entities) {
      Object.values(entities).forEach(entity => {
        const children = entity.shapes.map(shape => {
          const { color } = Phaser.Display.Color.ValueToColor(shape.colour)
          const x = shape.x + entity.x
          const y = shape.y + entity.y

          switch (shape.type) {
            case 'circle':
              return this.add.circle(x, y, shape.radius, color)
            case 'rectangle':
              return this.add.rectangle(x, y, shape.width, shape.height, color)
          }
        })

        this.objects.entities[entity.name] = this.add.container(
          entity.x, entity.y, children
        )
      })
    }

    // setup input handlers
    const keyboardEvents = {
      keydown: this.onKeyDown,
      keyup: this.onKeyUp
    }

    Object.entries(keyboardEvents).forEach(([event, handler]) => {
      if (!handler) return

      this.input.keyboard.on(event, ({ keyCode }) => {
        const newState = handler(keyCode, this.state)
        this._updateState(newState)
      })
    })

    const mouseEvents = {
      pointerdown: this.onMouseDown,
      pointerup: this.onMouseUp
    }

    Object.entries(mouseEvents).forEach(([event, handler]) => {
      if (!handler) return

      this.input.on(event, pointer => {
        const coordinates = {
          x: pointer.worldX,
          y: pointer.worldY
        }

        const newState = handler(pointer.button, coordinates, this.state)

        this._updateState(newState)
      })
    })
  }

  update(time, delta) {
    const entities = this.render(this.state.entities, time, delta)

    Object.entries(entities).forEach(([name, entity]) => {
      const object = this.objects.entities[name]

      object.setPosition(entity.x, entity.y)
    })

    this._updateState({...this.state, entities})
  }

  /**
   * @param {GameState} state
   */
  _updateState(state) {
    if (!state) {
      throw Error(
        'No state found. Did you forget to return the game state somewhere?'
      )
    }

    this.state = state
    this.history.push(state)

    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift()
    }
  }
}

/**
 * @param {GameFunctions} functions
 */
 const upUpAndAway = functions => {
  const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: new BearHug(functions)
  };

  global.game = new Phaser.Game(config);
}

module.exports = upUpAndAway
