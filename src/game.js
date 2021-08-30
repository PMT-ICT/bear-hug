const Phaser = require('phaser')

const rabbitDown = require('./assets/Rabbit_Down.png')
const rabbitUp = require('./assets/Rabbit_Up.png')
const rabbitLeft = require('./assets/Rabbit_Left.png')
const rabbitRight = require('./assets/Rabbit_Right.png')
const rabbitDead = require('./assets/Rabbit_Dead.png')

class BearHug extends Phaser.Scene {
  constructor(setup, render) {
    super();

    this.setup = setup
    this.render = render
    this.objects = {
      camera: undefined,
      entities: {}
    }
    this.entities = {}
  }

  preload() {
    this.load.image('rabbitDown', rabbitDown);
    this.load.image('rabbitUp', rabbitUp);
    this.load.image('rabbitLeft', rabbitLeft);
    this.load.image('rabbitRight', rabbitRight);
    this.load.image('rabbitDead', rabbitDead)
  }

  create() {
    const configuration = this.setup()

    if (!configuration) {
      throw Error('Function "setup" did not return anything.')
    }

    this.objects.camera = this.cameras.add(0, 0, 800, 600)

    const { background, entities } = configuration

    if (background) {
      this.objects.camera.setBackgroundColor(background)
    }

    if (entities) {
      entities.forEach(entity => {
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

        const object = this.add.container(entity.x, entity.y, children)
        this.objects.entities[entity.name] = object
        this.entities[entity.name] = entity
      })
    }
  }

  update(time, delta) {
    this.entities = this.render(time, delta, this.entities)

    Object.entries(this.entities).forEach(([name, entity]) => {
      const object = this.objects.entities[name]

      object.setPosition(entity.x, entity.y)
    })
  }
}

module.exports = BearHug
