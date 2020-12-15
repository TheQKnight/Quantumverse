<template>
  <div id="uiContainer">
    <div class="flexNotSupported">
      <span>Your browser size is not supported.</span>
    </div>
    <div class="flexMobile">
      Mobile bar
    </div>
    <div class="flexLeft">
      Game stats
    </div>
    <div class="flexMiddle">
      <div id="canvasContainer">
        <canvas id="gameCanvas">

        </canvas>
      </div>
    </div>
    <div class="flexRight">
      Chat and game info
    </div>
    <div id="temp">
      
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import client from '@/controllers/client'
import server from '@/controllers/server'

import req from '@/controllers/network'

export default {
  name: 'Test',
  data: () => ({
    canvasContainer: null,
    board: null,
    game: null
  }),
  methods: {
    async initCanvas() {
      try {
        const res = await req.getChessDefaults()
        this.game = res.data

        this.canvasContainer = document.getElementById('canvasContainer')
        const canvas = document.getElementById('gameCanvas')

        this.board = new client.GameBoard({
          canvas, 
          xMax: this.game.layout.xMax, 
          yMax: this.game.layout.yMax
        })
        this.board.init(document)

        this.onWindowResize()
        window.onresize = this.onWindowResize

        this.animate()

      } catch (err) {
        console.log(err)
      }
    },
    animate() {
      requestAnimationFrame(this.animate)

      this.board.render()
    },
    onWindowResize() {
      const canvasContainerHeight = this.canvasContainer.clientHeight
      const canvasContainerWidth = this.canvasContainer.clientWidth

      const canvasHeightToWidth = (this.game.layout.xMax + 1) / (this.game.layout.yMax + 1)
      const canvasWidthToHeight = (this.game.layout.yMax + 1) / (this.game.layout.xMax + 1)

      const projectedCanvasWidthFromWidth = canvasContainerWidth
      const projectedCanvasHeightFromWidth = canvasContainerWidth * canvasWidthToHeight
      //console.log(`${projectedCanvasWidthFromWidth}, ${projectedCanvasHeightFromWidth} Box: ${canvasContainerWidth}, ${canvasContainerHeight}`)

      const projectedCanvasWidthFromHeight = canvasContainerHeight * canvasHeightToWidth
      const projectedCanvasHeightFromHeight = canvasContainerHeight
      //console.log(`${projectedCanvasWidthFromHeight}, ${projectedCanvasHeightFromHeight} Box: ${canvasContainerWidth}, ${canvasContainerHeight}`)


      if (projectedCanvasWidthFromHeight < canvasContainerWidth) {
        // Perform this if widths overlap
        this.board.setCanvasSize(Math.round(projectedCanvasWidthFromHeight), Math.round(projectedCanvasHeightFromHeight))
        return;
      }

      if (projectedCanvasHeightFromWidth < canvasContainerHeight) {
        // Perform this if widths overlap but height doesnt
        this.board.setCanvasSize(Math.round(projectedCanvasWidthFromWidth), Math.round(projectedCanvasHeightFromWidth))
        return;
      }

    }
  },
  mounted () {
    this.initCanvas()
  }
}
</script>

<style>

#temp {
  display: none;
}

#uiContainer {
  flex-grow: 2;
  display: flex;
  width: 100%;
  height: 100%;
  flex-flow: wrap;
  justify-content: center;
  background: rgb(2, 192, 2);
  position: absolute;
  top: 0;
  left: 0;
}

#canvasContainer {
  display: flex;
  flex-flow: wrap;
  justify-content: center;
  align-content: center;
  width: 100%;
  height: 100%;
}

#gameCanvas {
  background: rgb(168, 0, 0);
}

.flexLeft {
  width: 20%;
  height: 100%;
  order: 1;
}

.flexMiddle {
  width: 50%;
  height: 100%;
  order: 2;
  background: rgb(0, 255, 200);
}

.flexRight {
  width: 30%;
  height: 100%;
  order: 3;
}

.flexMobile {
  width: 100%;
  height: 10%;
  order: 1;
  display: none;
}





.flexNotSupported {
  width: 100%;
  height: 100%;
  display: none;
}

@media (max-width: 900px) {
  .flexLeft {
    width: 30%;
    height: 70%;
    order: 2;
  }

  .flexMiddle {
    width: 70%;
    height: 70%;
    order: 1;
  }

  .flexRight {
    width: 100%;
    height: 30%;
    order: 3;
  }
}

@media (max-width: 450px) {
  .flexLeft {
    display: none;
    order: 3;
  }

  .flexMobile {
    display: block;
  }

  .flexMiddle {
    width: 100%;
    height: 85%;
    order: 2;
  }

  .flexRight {
    display: none;
    order: 2;
  }
}

@media (max-width: 260px) {

  .flexNotSupported {
    display: block;
  }

  .flexLeft {
    display: none;
  }

  .flexMobile {
    display: none;
  }

  .flexMiddle {
    display: none;
  }

  .flexRight {
    display: none;
  }
}

@media (max-height: 300px) {
  .flexNotSupported {
    display: block;
  }

  .flexLeft {
    display: none;
  }

  .flexMobile {
    display: none;
  }

  .flexMiddle {
    display: none;
  }

  .flexRight {
    display: none;
  }
}

</style>