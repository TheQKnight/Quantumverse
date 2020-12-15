/* eslint-disable */
import assets from '@/controllers/assetLoader'
class GameBoard {
  constructor(options) {
    this.canvas = options.canvas
    this.c = options.canvas.getContext('2d')
    this.xMax = options.xMax
    this.yMax = options.yMax
    this.board = {}
    this.squareSizeX = options.canvas.width / (options.xMax + 1)
    this.squareSizeY = options.canvas.height / (options.yMax + 1)

    // Controls
    this.mouseMoveEvent = null
    this.mouseXPixels = null
    this.mouseYPixels = null
    this.mouseX = null
    this.mouseY = null
    this.rightMouseDown = false
    this.leftMouseDown = false
    this.middleMouseDown = false

    // Assets
    this.assets = new assets.AssetLoader()
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
            x: x,
            y: y,
            fromX: Math.round(oldCanvasX),
            fromY: Math.round(oldCanvasY),
            toX: Math.round(onCanvasX),
            toY: Math.round(onCanvasY)
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
        gameSquare.render(this)
      }
    }
  }

  /**
   * Initializes the client game object with event listeners
   * @param {object} document document object from javascript
   */
  init(document) {
    this.setSquareDimensions(true)

    this.canvas.onmousemove = (e) => this.onMouseMove(e)
    document.addEventListener('contextmenu', e => e.preventDefault())
    document.addEventListener('dblclick', e => e.preventDefault())
    document.addEventListener('mousedown', e => this.onMouseDown(e))
    document.addEventListener('mouseup', e => this.onMouseUp(e))

    this.assets.loadAllAssets()
  }

  onMouseUp() {
    this.leftMouseDown = false
    this.rightMouseDown = false
    this.middleMouseDown = false
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.leftMouseDown = true
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
        if (found) break;
        currentBounds.fromX += this.squareSizeX
        currentBounds.toX += this.squareSizeX
      }
      if (found) break;
      currentBounds.fromX = 0
      currentBounds.toX = this.squareSizeX
      currentBounds.fromY += this.squareSizeY
      currentBounds.toY += this.squareSizeY
    }

  }
}

class GameSquare {
  constructor(options) {
    this.x = options.x
    this.y = options.y

    this.fromX = options.fromX
    this.fromY = options.fromY
    this.toX = options.toX
    this.toY = options.toY
    this.color = options.color



    this.renderBackground = options.renderBackground || function (game) {
      if (game.leftMouseDown && game.mouseX === this.x && game.mouseY === this.y) {
        game.c.fillStyle = 'yellow'
      } else if (!this.color) {
        if (this.x % 2 === 0 && this.y % 2 === 0 || this.x % 2 !== 0 && this.y % 2 !== 0) {
          game.c.fillStyle = 'white'
        } else {
          game.c.fillStyle = 'black'
        }
      } else {
        game.c.fillStyle = this.color
      }
      game.c.fillRect(this.fromX, this.fromY, this.toX, this.toY)
    }

    this.renderDecals = options.renderDecals || function (game) {
      
    }

    this.renderPiece = options.renderPiece || function (game) {
      
    }

    this.renderAnimation = options.renderAnimation || function (game) {
      
    }

  }

  setDimensions(options) {
    this.fromX = options.fromX
    this.fromY = options.fromY
    this.toX = options.toX
    this.toY = options.toY
  }

  setRender(options) {
    this.renderBackground = options.renderBackground || this.renderBackground
    this.renderDecals = options.renderDecals || this.renderDecals
    this.renderPiece = options.renderPiece || this.renderPiece
    this.renderAnimation = options.renderAnimation || this.renderAnimation
  }

  render(game) {
    this.renderBackground(game)
    this.renderDecals(game)
    this.renderPiece(game)
    this.renderAnimation(game)
  }

}

export default {
  GameBoard,
  GameSquare
}