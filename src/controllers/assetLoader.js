/* eslint-disable */
import req from '@/controllers/network'

class AssetLoader {
  constructor(options) {
    this.load = {
      total: 1,
      loaded: 0,
      errored: 0,
      textures: {
        total: 0,
        loaded: 0,
        errored: 0,
      },
      sounds: {
        total: 0,
        loaded: 0,
        errored: 0,
      },
      game: {
        total: 0,
        loaded: 0,
        errored: 0,
      },
      animations: {
        total: 0,
        loaded: 0,
        errored: 0,
      },
    }

    this.images = {}
    this.sounds = {}
    this.game = {}
    this.animations = {}

    this.ready = false
    this.loadingInterval = null
  }

  async loadAllAssets(loadingFunction, finishingFunction) {
    // Setup load checker
    this.loadingInterval = setInterval(function () {
      if (loadingFunction) loadingFunction(this.load)
      if (this.load.loaded + this.load.errored === this.load.total) {
        clearInterval(this.loadingInterval)
        this.loadingInterval = null
        this.ready = true
        if (finishingFunction) finishingFunction(this.load)
      }
    }.bind(this), 10)

    // Retrieve assets
    this.retrieveAssets()
  }
  
  async retrieveAssets(game='chess') {
    try {
      const res = await req.getGameAssets(game)

      const textures = res.data.textures
      const sounds = res.data.sounds
      const settings = res.data.game
      const animations = res.data.animations

      // // Add everything but animations to the total animations number
      // this.assetsTotal = textures.length + sounds.length + game.length
      // // Add animations to the total assets

      this.load.textures.total = textures.length
      this.load.sounds.total = sounds.length
      this.load.game.total = settings.length

      animations.forEach(animation => {
        animation.steps.forEach(() => {
          this.load.animations.total++
        })
        Object.keys(animation.sounds).forEach(() => {
          this.load.animations.total++
        })
      })

      this.load.total = this.load.textures.total + this.load.sounds.total + this.load.game.total + this.load.animations.total

      textures.forEach(texture => {

        if (texture.indexOf('.png') !== -1) {
          const imageObj = new Image()

          imageObj.onload = function () {
            this.load.textures.loaded++
            this.load.loaded++
          }.bind(this)

          imageObj.onerror = function () {
            this.load.textures.errored++
            this.load.errored++
          }.bind(this)

          imageObj.src = texture

          const name = texture.split('/textures/')[1]

          this.images[name] = class CanvasImage {
            constructor(options) {
              this.image = imageObj
          
              this.from = options.from || 'bottom-right'
              this.x = options.x
              this.y = options.y
              this.width = options.width
              this.height = options.height
            }
          
            setDimensions(x, y, width, height) {
              this.x = x
              this.y = y
              this.width = width
              this.height = height
            }
          
            render(c) {
              const image = this.image

              let width
              let height
              if (this.width && !this.height) {
                width = this.width
                height = this.width / image.width * image.height
              } else if (this.height && !this.width) {
                width = this.height / image.height * image.width
                height = this.height
              } else if (!this.height && !this.width) {
                width = image.width
                height = image.height
              } else {
                width = this.width
                height = this.height
              }

              let x = 0
              let y = 0
              if (this.from === 'top-left') {
                x = this.x
                y = this.y
              }
              if (this.from === 'top-right') {
                x = this.x - width
                y = this.y
              }
              if (this.from === 'bottom-right') {
                x = this.x - width
                y = this.y - height
              }
              if (this.from === 'bottom-left') {
                x = this.x
                y = this.y - height
              }
              if (this.from === 'center') {
                x = this.x - width / 2
                y = this.y - height / 2
              }

              c.imageSmoothingEnabled = false
              c.drawImage(image, x, y, width, height)
            }
          }
          
        }
      })

      sounds.forEach(sound => {
        if (sound.indexOf('.mp3') !== -1) {
          const audioObj = new Audio(sound)

          // Loading only happens when audio is called

          // audioObj.onload = function () {
          //   this.load.sounds.loaded++
          //   this.load.loaded++
          // }.bind(this)

          // audioObj.onerror = function () {
          //   this.load.sounds.errored++
          //   this.load.errored++
          // }.bind(this)


          const name = sound.split('/sounds/')[1].replace('.mp3', '')

          this.sounds[name] = {
            sound: audioObj,
            play() {
              const clonedNode = this.sound.cloneNode(false)
              clonedNode.play()
            }
          }
          // Loading only happens when audio is called

          this.load.sounds.loaded++
          this.load.loaded++
          
        }
      })

      settings.forEach(settingLink => {
        if (settingLink.indexOf('.json') !== -1) {
          var oReq = new XMLHttpRequest();
          oReq.addEventListener('load', function (e) {
            const res = JSON.parse(e.currentTarget.response)
            if (res.actions) this.game.actions = res.actions
            if (res.assets) this.game.assets = res.assets
            if (res.conditions) this.game.conditions = res.conditions
            if (res.layout) this.game.layout = res.layout
            if (res.pieces) this.game.pieces = res.pieces
            this.load.game.loaded++
            this.load.loaded++
          }.bind(this))
          oReq.open('GET', settingLink)
          oReq.send()
          
        }
      })

      // Animations
      animations.forEach(animation => {
        const animationSteps = animation.steps.map((step, index) => {
          const imageObj = new Image()

          imageObj.onload = function () {
            this.load.animations.loaded++
            this.load.loaded++
          }.bind(this)

          imageObj.onerror = function () {
            this.load.animations.errored++
            this.load.errored++
          }.bind(this)

          imageObj.src = step
          
          const animationStep = {
            image: imageObj
          }
          if (animation.sounds[index]) {
            const audioObj = new Audio(animation.sounds[index])
            
            // Loading only happens when audio is called

            // audioObj.onload = function () {
            //   this.load.animations.loaded++
            //   this.load.loaded++
            // }.bind(this)
  
            // audioObj.onerror = function () {
            //   this.load.animations.errored++
            //   this.load.errored++
            // }.bind(this)
            
            // Loading only happens when audio is called

            this.load.animations.loaded++
            this.load.loaded++

            animationStep.sound = audioObj
          }
          return animationStep
        })

        // Make constructor for each animation
        this.animations[animation.name] = class CanvasAnimation {
          constructor(options) {
            this.steps = animationSteps,
            this.fps = animation.fps
        
            this.from = options.from || 'bottom-right'
            this.x = options.x
            this.y = options.y
            this.width = options.width
            this.height = options.height
        
            this.playing = false
            this.onStep = 0
            this.animationCounter = null
          }
        
          render(c) {
            if (this.playing) {
              const image = this.steps[this.onStep].image


              let width
              let height
              if (this.width && !this.height) {
                width = this.width
                height = this.width / image.width * image.height
              } else if (this.height && !this.width) {
                width = this.height / image.height * image.width
                height = this.height
              } else if (!this.height && !this.width) {
                width = image.width
                height = image.height
              } else {
                width = this.width
                height = this.height
              }

              let x = 0
              let y = 0
              if (this.from === 'top-left') {
                x = this.x
                y = this.y
              }
              if (this.from === 'top-right') {
                x = this.x - width
                y = this.y
              }
              if (this.from === 'bottom-right') {
                x = this.x - width
                y = this.y - height
              }
              if (this.from === 'bottom-left') {
                x = this.x
                y = this.y - height
              }
              if (this.from === 'center') {
                x = this.x - width / 2
                y = this.y - height / 2
              }

              c.imageSmoothingEnabled = false
              c.drawImage(image, x, y, width, height)
            }
          }
        
          playStepSound(step) {
            if (step.sound) {
              const clonedNode = step.sound.cloneNode(false)
              clonedNode.play()
            }
          }
        
          setDimensions(x, y, width, height) {
            this.x = x
            this.y = y
            this.width = width
            this.height = height
          }
        
          play(loop) {
            if (this.playing) return;
            this.playing = true
            this.animationCounter = setInterval(function () {
              this.playStepSound(this.steps[this.onStep])
              this.onStep++
              if (this.onStep > this.steps.length - 1) {
                this.stop()
                if (loop) this.play(true)
              }
            }.bind(this), 1000 / this.fps)
          }
        
          stop() {
            if (!this.playing) return;
            clearInterval(this.animationCounter)
            this.playing = false
            this.onStep = 0
            this.animationCounter = null
          }
        
        }

      })
    } catch (err) {
      console.log(err)
    }
  }
}

export default {
  AssetLoader
}