/* eslint-disable */
import req from '@/controllers/network'
import config from '@/controllers/config'

class AssetLoader {
  constructor(options) {
    this.assetsLoaded = 0
    this.assetsTotal = 100
    this.assetsErrored = 0
    this.images = {}
    this.animations = {}

    this.loadingInterval = null
  }

  async loadAllAssets(loadingFunction) {
    // Setup load checker
    this.loadingInterval = setInterval(function () {
      if (loadingFunction) this.loadingFunction(this.assetsLoaded, this.assetsTotal, this.assetsErrored)
      if (this.assetsLoaded === this.assetsTotal) {
        clearInterval(this.loadingInterval)
        this.loadingInterval = null
      }
    }.bind(this), 10)

    // Retrieve assets
    this.retrieveAssets()
  }
  
  async retrieveAssets() {
    try {
      const res = await req.getAssets()
      
      const assets = res.data.assets
      const animations = res.data.animations

      let totalAnimationAssets = 0
      animations.forEach(animation => {
        animation.steps.forEach(() => {
          totalAnimationAssets++
        })
        Object.keys(animation.sounds).forEach(() => {
          totalAnimationAssets++
        })
      })

      this.assetsTotal = assets.length + totalAnimationAssets
      assets.forEach(asset => {
        const totalAssetPath = `${config.backendURL}${asset}`

        if (asset.indexOf('.png') !== -1) {
          const imageObj = new Image()

          imageObj.onload = function () {
            this.assetsLoaded++
          }.bind(this)

          imageObj.onerror = function () {
            this.assetsLoaded++
            this.assetsErrored++
          }.bind(this)

          imageObj.src = totalAssetPath
          this.images[asset] = imageObj
        }
      })

      animations.forEach(animation => {
        const animationSteps = animation.steps.map((step, index) => {
          const totalAssetPath = `${config.backendURL}${step}`
          const imageObj = new Image()

          imageObj.onload = function () {
            this.assetsLoaded++
          }.bind(this)

          imageObj.onerror = function () {
            this.assetsLoaded++
            this.assetsErrored++
          }.bind(this)

          imageObj.src = totalAssetPath
          
          const animationStep = {
            image: imageObj
          }
          if (animation.sounds[index]) {
            const audioObj = new Audio(animation.sounds[index])
            audioObj.onload = function () {
              this.assetsLoaded++
            }.bind(this)
  
            audioObj.onerror = function () {
              this.assetsLoaded++
              this.assetsErrored++
            }.bind(this)

            animationStep.sound = audioObj
          }
          return animationStep
        })

        // Make constructor for each animation
        this.animations[animation.name] = class Animation {
          constructor(options) {
            this.steps = animationSteps
            this.fps = animation.fps
        
            this.x = options.x || null
            this.y = options.y || null
            this.width = options.width || null
            this.height = options.height || null
        
            this.playing = false
            this.onStep = 0
            this.animationCounter = null
          }
        
          render(c) {
            if (playing) {
              this.drawStepImage(c, this.steps[this.onStep])
            }
          }
        
          drawStepImage(c, step) {
            c.drawImage(step.image, this.x, this.y, this.width, this.height)
          }
        
          playStepSound(step) {
            if (step.sound) step.sound.play()
          }
        
          setDimensions(x, y, width, height) {
            this.x = x
            this.y = y
            this.width = width
            this.height = height
          }
        
          animate(c) {
            this.playing = true
            this.animationCounter = setInterval(function () {
              playStepSound(this.step[this.onStep])
              this.onStep++
              if (this.onStep > this.steps.length) {
                this.playing = false
                clearInterval(this.animationCounter)
              }
            }.bind(this), 1000 / this.fps)
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