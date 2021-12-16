import { enableES5, produce, setAutoFreeze } from 'immer'
import { cond, partition, pickBy, pipe } from 'lodash/fp'
import Phaser from 'phaser'
import { Font } from '.'

import { Entity, Shape } from './entity'
import { otherwise } from './funfunfun'
import { Text } from './text'

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

    if (!functions.setup) {
      throw Error('Missing required function: setup')
    }

    this.setup = functions.setup
    this.onUpdate = functions.update || (state => state)
    this.onKeyDown = functions.onKeyDown || ((key, state) => state)
    this.onKeyUp = functions.onKeyUp || ((key, state) => state)
    this.onMouseDown = functions.onMouseDown || ((btn, coordinates, state) => state)
    this.onMouseUp = functions.onMouseUp || ((btn, coordinates, state) => state)

    this.objects = {
      camera: undefined,
      entities: {}
    }
  }

  init() {
    // disable Immer's autofreeze - so objects can still be mutated by consumer
    setAutoFreeze(false)

    // enable ES5 support
    enableES5()
  }

  preload() {
    // any assets that need to be preloaded go here
  }

  create() {
    const initialState = this.setup(this.state)

    this._updateState(initialState, 'setup function')

    this.objects.camera = this.cameras.add(
      0, 0, window.innerWidth, window.innerHeight
    )

    this.scale.on('resize', function ({ width, height }) {
      this.cameras.resize(width, height)
    }, this)

    const { scene } = initialState

    if (scene.background) {
      this.objects.camera.setBackgroundColor(scene.background)
    }

    this._createOrUpdateGameObjects(this.state)

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
        this._createOrUpdateGameObjects(newState)
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
        .filter(([name, _]) => this.objects.entities[name])
        .map(([name, entity]) => {
          const object = this.objects.entities[name]

          return [name, this._updateEntity(entity, object)]
        })
    )

    this._updateState(
      { ...this.state, entities: updatedEntities },
      'update function - start'
    )

    // next, call the user's update function to get the changed state
    const state = this.onUpdate(this.state, time, delta)

    // update state again with the user's updates
    this._updateState(state, 'update function - end')

    // reflect changes in state in game objects
    this._createOrUpdateGameObjects(state)

    // finally, clean up any orphaned game objects
    this._cleanUpOrphanedGameObjects(state)
  }

  /**
   * @param {Phaser.GameObjects.GameObject} object
   * @param {Entity} entity
   */
  _updateObject(object, entity) {
    const updatePosition = object => object.setPosition(entity.x, entity.y)

    /** @param {Phaser.GameObjects.GameObject} object */
    const updateVelocity = object => {
      if (object.body) {
        object.body.setVelocityX(entity.velocity.x)
          .setVelocityY(entity.velocity.y)
      }

      return object
    }

    const updateAngle = object => object.setAngle(entity.angle)

    const updateText = object => entity instanceof Text
      ? object.setText(entity.content)
      : object

    const update = pipe(
      updatePosition,
      updateVelocity,
      updateAngle,
      updateText
    )

    update(object)
  }

  /**
   * @param {Entity} entity
   * @param {Phaser.GameObjects.GameObject} object
   */
  _updateEntity(entity, object) {
    const clone = produce(entity, draft => {
      draft.x = object.x
      draft.y = object.y

      if (object.body) {
        draft.velocity = {
          x: object.body.velocity.x,
          y: object.body.velocity.y
        }
      }
    })

    return clone
  }

  /** 
   * @param {string} name
   * @param {Entity} entity 
   */
  _createObject(name, entity) {
    const createContainer = (object = null) => {
      if (object && entity.components.length === 0) {
        return object
      }

      const children = entity.components.length > 0
        ? entity.components.map(c => this._createObject(c.name, c))
        : []

      return this.add.container(
        entity.x, entity.y, object ? [object, ...children] : children
      ).setData('name', entity.name)
    }

    const createShape = () => {
      const { color } = Phaser.Display.Color.ValueToColor(entity.colour)
      const x = entity.x
      const y = entity.y

      switch (entity.classification) {
        case 'circle':
          return this.add.circle(x, y, entity.radius, color)
            .setDepth(entity.z)
            .setAngle(entity.angle)
        case 'rectangle':
          return this.add.rectangle(x, y, entity.width, entity.height, color)
            .setDepth(entity.z)
            .setAngle(entity.angle)
      }
    }

    const createText = () => {
      return this.add.text(entity.x, entity.y, entity.content, {
        fontFamily: entity.fontFamily,
        fontSize: entity.fontSize,
        color: entity.colour
      }).setDepth(entity.z).setAngle(entity.angle)
    }

    const createObject = cond([
      [entity => entity instanceof Shape, createShape],
      [entity => entity instanceof Text, createText],
      [otherwise, () => null]
    ])

    const container = pipe(createObject, createContainer)(entity)

    // when the object is destroyed, update state to remove entity
    container.on('destroy', () => {
      const [name, _] = Object.entries(this.objects.entities)
        .find(([_, object]) => object === container) || []

      if (name) {
        const isNotDestroyedEntity = (_, key) => key !== name

        this._updateState({
          ...this.state,
          entities: pickBy(isNotDestroyedEntity, this.state.entities)
        })

        this.objects = {
          ...this.objects,
          entities: pickBy(isNotDestroyedEntity, this.objects.entities)
        }
      }
    })

    if (entity.timeToLive !== Infinity) {
      this.time.addEvent({
        delay: entity.timeToLive,
        callback: container.destroy,
        callbackScope: container
      })
    }

    if (entity.isRoot) {
      if (!entity.isStatic) {
        const bounds = container.getBounds()
        container.setSize(bounds.width, bounds.height)

        this.physics.world.enable(container)

        const xOffset = bounds.x - container.body.x
        const yOffset = bounds.y - container.body.y

        container.body
          .setOffset(xOffset, yOffset)
          .setCollideWorldBounds(true)
          .setAllowGravity(true)
      }

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

    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history.shift()
    }
  }

  /** @param {GameState} state */
  _createOrUpdateGameObjects(state) {
    Object.entries(state.entities).forEach(([name, entity]) => {
      const object = this.objects.entities[name]

      if (object) {
        this._updateObject(object, entity)
      } else {
        this._createObject(name, entity)
      }

      // TODO: create function that recursively creates objects for newly added components
    })
  }

  /** @param {GameState} state */
  _cleanUpOrphanedGameObjects(state) {
    const separateOrphans = pipe(
      Object.entries,
      partition(([key, _]) => state.entities[key])
    )

    const [toKeep, toDitch] = separateOrphans(this.objects.entities)

    toDitch.forEach(([_, object]) => {
      object.destroy()
    })

    this.objects.entities = Object.fromEntries(toKeep)
  }
}

const loadFonts = async () => {
  const loadFont = async (name, url) => {
    const font = new FontFace(name, `url(${url})`)
    const loadedFont = await font.load()

    document.fonts.add(loadedFont)
  }

  const fonts = [
    [Font.MINECRAFT, 'minecraft/Minecraft.ttf'],
    [Font.GOTHIC_PIXELS, 'gothic_pixels/GothicPixels.ttf'],
    [Font.EDIT_UNDO_LINE, 'edit_undo_line/edunline.ttf'],
    [Font.MONSTER_FRIEND_FORE, 'monster_friend_fore/MonsterFriendFore.otf'],
    [Font.GYPSY_CURSE, 'gypsy_curse/GypsyCurse.ttf']
  ]

  await Promise.all(
    fonts.map(([name, path]) => loadFont(name, `assets/fonts/${path}`))
  )
}

/**
 * @param {GameFunctions} functions
 * @param {boolean} debug
 */
export const commence = (functions, debug = false) => {
  loadFonts().then(() => {
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
        mode: Phaser.Scale.NONE,
        parent: 'phaser-example',
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    global.game = new Phaser.Game(config)

    window.addEventListener('resize', function () {
      global.game.scale.resize(window.innerWidth, window.innerHeight)
    }, false)
  })
}
