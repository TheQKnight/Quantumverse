/* eslint-disable */
import assets from '@/controllers/assetLoader'
import math from '@/controllers/math'
class GameBoard {
  constructor(options) {
    // Client Logic
    this.canvas = options.canvas
    this.c = options.canvas.getContext('2d')
    this.squareSizeX = options.canvas.width / (options.xMax + 1)
    this.squareSizeY = options.canvas.height / (options.yMax + 1)

    // Game Logic
    this.actions = null
    this.conditions = null
    this.layout = null
    this.pieces = null
    this.textures = null
    this.board = {}
    this.takenPieces = []
    this.activeTurn = 'white'
    this.turns = {
      white: 0,
      black: 0
    }

    this.xMax = options.xMax
    this.yMax = options.yMax
    // Controls
    this.mouseMoveEvent = null
    this.mouseXPixels = null
    this.mouseYPixels = null
    this.mouseX = null
    this.mouseY = null
    this.rightMouseDown = false
    this.leftMouseDown = false
    this.middleMouseDown = false
    this.mouseFromX = -1
    this.mouseFromY = -1
    this.mouseToX = -1
    this.mouseToY = -1
    this.mouseStyle = 'pointer'

    this.selectedLocation = {
      x: -1,
      y: -1,
      fromX: -1,
      fromY: -1,
      toX: -1,
      toY: -1
    }

    // Assets
    this.assets = new assets.AssetLoader()

    this.activeAnimations = []
    this.activeImages = []

    // Dev
    this.dev = options.dev
  }

  setMouseStyle(style) {
    this.canvas.style.cursor = style
  }

  getRealCoords(x, y) {
    const gameSquare = this.board[x][y]
    return {
      fromX: gameSquare.fromX,
      fromY: gameSquare.fromY,
      toX: gameSquare.toX,
      toY: gameSquare.toY,
      squareSizeX: gameSquare.toX - gameSquare.fromX,
      squareSizeY: gameSquare.toY - gameSquare.fromY
    }
  }

  spawnAnimationAtSquare(animationName, x, y) {
    const coords = this.getRealCoords(x, y)
    const newAnimation = new this.assets.animations[animationName]({
      x: coords.fromX,
      y: coords.fromY + coords.squareSizeY,
      width: coords.toX - coords.fromX,
      from: 'bottom-left'
    })
    this.activeAnimations.push(newAnimation)
    newAnimation.play(true)

  }

  spawnImageAtSquare(imageName, x, y) {
    const coords = this.getRealCoords(x, y)
    const newImage = new this.assets.images[imageName]({
      x: coords.fromX,
      y: coords.fromY + coords.squareSizeY,
      width: coords.toX - coords.fromX,
      from: 'bottom-left'
    })
    this.activeImages.push(newImage)
  }

  setCanvasSize(width, height) {
    this.canvas.width = width
    this.canvas.height = height
    this.squareSizeX = width / (this.xMax + 1)
    this.squareSizeY = height / (this.yMax + 1)

    this.setSquareDimensions()
  }

  setSquareDimensions(refreshBoard) {
    const canvasXSplit = this.canvas.width / (this.xMax + 1)
    const canvasYSplit = this.canvas.height / (this.yMax + 1)

    let onCanvasX = 0
    for (var x = 0; x < this.xMax + 1; x++) {
      if (!this.board[x]) this.board[x] = {}

      const oldCanvasX = onCanvasX
      onCanvasX += canvasXSplit
      let onCanvasY = 0
      for (var y = 0; y < this.yMax + 1; y++) {
        const oldCanvasY = onCanvasY
        onCanvasY += canvasYSplit

        if (refreshBoard) {
          this.board[x][y] = new GameSquare({
            game: this,
            x: x,
            y: y,
            fromX: Math.round(oldCanvasX),
            fromY: Math.round(oldCanvasY),
            toX: Math.round(onCanvasX),
            toY: Math.round(onCanvasY),
          })
        } else {
          const gameSquare = this.board[x][y]
          gameSquare.setDimensions({
            fromX: Math.round(oldCanvasX),
            fromY: Math.round(oldCanvasY),
            toX: Math.round(onCanvasX),
            toY: Math.round(onCanvasY)
          })
        }
      }
    }
  }

  render() {
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (var x = 0; x < this.xMax + 1; x++) {
      for (var y = 0; y < this.yMax + 1; y++) {
        const gameSquare = this.board[x][y]
        gameSquare.renderBackground(this.c)
        gameSquare.renderDecals(this.c)
      }
    }
    // Render game pieces after background and decals
    for (var x = 0; x < this.xMax + 1; x++) {
      for (var y = 0; y < this.yMax + 1; y++) {
        const gameSquare = this.board[x][y]
        gameSquare.renderPiece(this.c)
      }
    }
    // Render animations second to last
    this.activeAnimations.forEach(animation => {
      animation.render(this.c)
    })
    // Render loose images last
    this.activeImages.forEach(img => {
      img.render(this.c)
    })
  }

  /**
   * Initializes the client game object with event listeners
   * @param {object} document document object from javascript
   */
  init(document, loadFunction, onLoadedFunction) {
    document.addEventListener('mousemove', e => this.onMouseMove(e))
    document.addEventListener('contextmenu', e => e.preventDefault())
    document.addEventListener('dblclick', e => e.preventDefault())
    document.addEventListener('mousedown', e => this.onMouseDown(e))
    document.addEventListener('mouseup', e => this.onMouseUp(e))

    this.setSquareDimensions(true)

    this.assets.loadAllAssets(function (load) {
      if (loadFunction) {
        loadFunction(load)
      } else {
        console.log(`${load.loaded} / ${load.total} Errored: ${load.errored}`)
        console.log(`Textures: ${load.textures.loaded} / ${load.textures.total} Errored: ${load.textures.errored}`)
        console.log(`Sounds: ${load.sounds.loaded} / ${load.sounds.total} Errored: ${load.sounds.errored}`)
        console.log(`Game: ${load.game.loaded} / ${load.game.total} Errored: ${load.game.errored}`)
        console.log(`Animations: ${load.animations.loaded} / ${load.animations.total} Errored: ${load.animations.errored}`)
      }
    }, function (load) {
      if (onLoadedFunction) {
        onLoadedFunction(load)
      } else {
        console.log(`Loading Complete`)
      }
    }.bind(this))

  }

  onMouseUp() {
    this.leftMouseDown = false
    this.rightMouseDown = false
    this.middleMouseDown = false
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.leftMouseDown = true
      if (this.mouseX !== -1 || this.mouseY !== -1) {
        this.selectedLocation = {
          x: this.mouseX,
          y: this.mouseY,
          fromX: this.mouseFromX,
          fromY: this.mouseFromY,
          toX: this.mouseToX,
          toY: this.mouseToY,
        }
      }
    }
    if (e.button === 1) {
      this.middleMouseDown = true
    }
    if (e.button === 2) {
      this.rightMouseDown = true
    }
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    this.mouseXPixels = mouseX
    this.mouseYPixels = mouseY
    this.mouseMoveEvent = e

    // Track mouse in game x and y coords and map to mouseX and mouseY
    const currentBounds = {
      fromX: 0,
      fromY: 0,
      toX: this.squareSizeX,
      toY: this.squareSizeY
    }

    let found = false
    for (var y = 0; y < this.yMax + 1; y++) {
      for (var x = 0; x < this.xMax + 1; x++) {
        if (currentBounds.fromX < mouseX && currentBounds.fromY < mouseY && currentBounds.toX > mouseX && currentBounds.toY > mouseY) {
          this.mouseX = x
          this.mouseY = y
          found = true
        }
        // Found the relating x and y coords
        if (found) {
          this.mouseFromX = currentBounds.fromX
          this.mouseFromY = currentBounds.fromY
          this.mouseToX = currentBounds.toX
          this.mouseToY = currentBounds.toY
          if (this.board[x][y].piece && !this.leftMouseDown) {
            this.setMouseStyle('grab')
          } else {
            this.setMouseStyle('pointer')
          }
          break;
        }
        currentBounds.fromX += this.squareSizeX
        currentBounds.toX += this.squareSizeX
      }
      if (found) break;
      currentBounds.fromX = 0
      currentBounds.toX = this.squareSizeX
      currentBounds.fromY += this.squareSizeY
      currentBounds.toY += this.squareSizeY
    }
    if (!found && this.mouseX !== -1 && this.mouseY !== -1) {
      this.mouseX = -1
      this.mouseY = -1
    }

  }
}

class GameSquare {
  constructor(options) {
    this.game = options.game

    this.x = options.x
    this.y = options.y

    this.fromX = options.fromX
    this.fromY = options.fromY
    this.toX = options.toX
    this.toY = options.toY

    this.decals = []
    this.piece = null
  }

  setDimensions(options) {
    this.fromX = options.fromX
    this.fromY = options.fromY
    this.toX = options.toX
    this.toY = options.toY
  }

  renderBackground(c) {
    let color
    if (this.x % 2 === 0 && this.y % 2 === 0 || this.x % 2 !== 0 && this.y % 2 !== 0) {
      color = 'white'
    } else {
      color = 'black'
    }

    if (this.game.leftMouseDown && this.game.mouseX === this.x && this.game.mouseY === this.y) {
      c.fillStyle = color === 'white' ? '#e8e1d5' : '#757575'
    } else {
      if (color === 'white') c.fillStyle = '#e0d3bc'
      if (color === 'black') c.fillStyle = '#525252'
    }

    c.fillRect(this.fromX, this.fromY, this.toX, this.toY)
  }

  renderDecals(c) {
    if (this.game.selectedLocation) {
      if (this.x === this.game.selectedLocation.x && this.y === this.game.selectedLocation.y) {
        const squareSize = this.toX - this.fromX
        c.fillStyle = 'red'
        const diff = squareSize / 8

        let fromX = this.fromX
        let fromY = this.fromY
        let toX = diff
        let toY = this.toY
        c.fillRect(fromX, fromY, toX, toY)
        fromX = this.fromX
        fromY = this.fromY
        toX = this.toX
        toY = diff
        c.fillRect(fromX, fromY, toX, toY)
        fromX = this.fromX + diff * 7
        fromY = this.fromY
        toX = this.toX
        toY = this.toY
        c.fillRect(fromX, fromY, toX, toY)
        fromX = this.fromX
        fromY = this.fromY + diff * 7
        toX = this.toX
        toY = this.toY
        c.fillRect(fromX, fromY, toX, toY)
      }
    }

    this.decals.forEach(decal => {
      decal.render(this.game)
    })
  }

  renderPiece(c) {
    if (!this.piece) return;
    this.piece.render()
  }

}

export default {
  GameBoard,
  GameSquare
}