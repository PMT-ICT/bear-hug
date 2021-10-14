const Phaser = require('phaser')
const GameScalePlugin = require('phaser-plugin-game-scale')
const _ = require('lodash')



const { Entity, Shape } = require('./entity')

/**
 * @typedef {Object} Scene
 * @property {string} background Background colour of the scene, as a hexadecimal string. Use a colourpicker!
 */


/**
 * @typedef {Object} GameState
 * @property {Object.<string, Entity>} entities
 * @property {Scene} scene
 * @property {Object} bigBurlapSack Container for user-defined state. Anything goes!
 */


/**
 * @callback setup
 * @returns {GameState}
 */


/**
 * @callback update
 * @param {GameState} state
 * @param {number} time
 * @param {number} delta
 * @returns {GameState}
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
 * @property {update} update
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
    this.state = {
      entities: {},
      scene: {},
      bigBurlapSack: {}
    }

    /** @type {Array<GameState>} */
    this.history = []

    this.setup = functions.setup
    this.onUpdate = functions.update
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
    const initialState = this.setup(this.state)

    this._updateState(initialState, 'setup function')

    this.objects.camera = this.cameras.add(0, 0, 800, 600)

    const { entities, scene } = initialState

    if (scene.background) {
      this.objects.camera.setBackgroundColor(scene.background)
    }

    if (entities) {
      Object.entries(entities).forEach(([name, entity]) => {
        this._createEntity(name, entity)
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
        this._updateState(newState, `${event} handler`)
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

        this._updateState(newState, `${event} handler`)
      })
    })
  }

  update(time, delta) {
    // first, gather any changes in game object state and update entity
    // state to match
    const updatedEntities = Object.fromEntries(
      Object
        .entries(this.state.entities)
        .map(([name, entity]) => {
          const object = this.objects.entities[name]

          return [name, this._updateEntity(entity, object)]
      })
    )

    this._updateState(
      {...this.state, entities: updatedEntities}, 
      'update function - start'
    )

    // next, call the user's update function to get the changed state
    const state = this.onUpdate(this.state, time, delta)

    // finally, update state again with the user's updates
    this._updateState(state, 'update function')
  }

  /**
   * @param {Phaser.GameObjects.GameObject} object
   * @param {Entity} entity
   */
  _updateObject(object, { x, y, velocity, angle }) {
    const positionChanged = object.x != x || object.y != y
    
    if (positionChanged) {
      object.setPosition(x, y)
    }

    const xVelocityChanged = object.body.velocity.x != velocity.x

    if (xVelocityChanged) {
      object.body.setVelocityX(velocity.x)
    }
    
    const yVelocityChanged = object.body.velocity.y != velocity.y

    if (yVelocityChanged) {
      object.body.setVelocityY(velocity.y)
    }

    const angleChanged = object.angle != angle

    if (angleChanged) {
      object.setAngle(angle)
    }
  }

  /**
   * @param {Entity} entity
   * @param {Phaser.GameObjects.GameObject} object
   */
  _updateEntity(entity, object) {
    const clone = _.cloneDeep(entity)

    clone.x = object.x
    clone.y = object.y
    clone.velocity = {
      x: object.body.velocity.x,
      y: object.body.velocity.y
    }

    return clone
  }

  /** 
   * @param {string} name
   * @param {Entity} entity 
   */
  _createEntity(name, entity) {
    const createShape = (shape) => {
      const { color } = Phaser.Display.Color.ValueToColor(shape.colour)
      const x = shape.x
      const y = shape.y
  
      switch (shape.type) {
        case 'circle':
          return this.add.circle(x, y, shape.radius, color)
            .setDepth(shape.z)
            .setAngle(shape.angle)
        case 'rectangle':
          return this.add.rectangle(x, y, shape.width, shape.height, color)
            .setDepth(shape.z)
            .setAngle(shape.angle)
      }
    }

    const shape = entity.isShape ? createShape(entity) : undefined

    if (entity.components.length === 0) {
      return shape || this.add.container(entity.x, entity.y, [])
    }
    
    const children = entity.components.map(component => {
      return this._createEntity(component.name, component)
    })

    const container = this.add.container(
      entity.x, entity.y, shape ? [shape, ...children] : children
    )

    if (entity.isRoot) {
      const bounds = container.getBounds()
      container.setSize(bounds.width, bounds.height)
      
      this.physics.world.enable(container)
      
      const xOffset = bounds.x - container.body.x
      const yOffset = bounds.y - container.body.y
      
      container.body
        .setOffset(xOffset, yOffset)
        .setCollideWorldBounds(true)
        .setAllowGravity(true)
      
      this.objects.entities[name] = container
    }

    return container
  }

  /**
   * @param {GameState} state
   * @param {string} source Name to identify the calling function, in case of error.
   */
  _updateState(state, source) {
    if (!state) {
      throw Error(
        `[${source}]: No state found. Did you forget to return the game state?`
      )
    }

    this.state = state
    this.history.push(state)
    
    // reflect state change in game objects
    Object.entries(state.entities).forEach(([name, entity]) => {
      const object = this.objects.entities[name]

      if (object) {
        this._updateObject(object, entity)
      }
    })

    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift()
    }
  }
}

/**
 * @param {GameFunctions} functions
 * @param {boolean} debug
 */
 const upUpAndAway = (functions, debug=false) => {
  const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    scene: new BearHug(functions),
    physics: {
      default: 'arcade',
      arcade: {
        debug,
        gravity: { y: 200 },
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      parent: 'phaser-example',
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
    }
  };

  global.game = new Phaser.Game(config);
}

module.exports = upUpAndAway
