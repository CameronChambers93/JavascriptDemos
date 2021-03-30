<template>
  <div class="md-layout md-gutter">
    <div class="md-layout-item md-layout md-gutter md-alignment-top-center">
      <div id="game-container" class="md-layout-item md-size-100">
        <canvas @click="click" @mousemove="showCoords" id="balldemo" ref="balldemo" style="border: 1px solid black" />
      </div>
      <div style="display: flex; flex-wrap: wrap;">
        <div style="width: 100%;">
          {{x}}, {{y}}
        </div>
        <div v-if="game" style="width: 100%;">
          Size: 
          <button @click="game.setPieceSize(game.pieceSize + 1)">+</button>
          {{ game.pieceSize }}
          <button @click="game.setPieceSize(game.pieceSize - 1)">-</button>
        </div>
        <div v-if="game" style="width: 100%;">
          Units: 
          <button @click="game.removePieceFromClient()">-</button>
          {{ game.pieceAmount }}
          <button @click="game.addPieceFromClient()">+</button>
        </div>
        <div style="width: 100%;">
          <button v-if="game" @click="game.resetGameFromClient()">Reset</button>
          <button v-else>Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BallDemo from './BallDemo.js'
export default {
  name: 'Game',
  props: {
    
  },
  data: function() {
    return {
      loaded: false,
      boardWidth: 745,
      tileWidth: 75,
      game: null,
      x: 0,
      y: 0,
      aiGame: null
    }
  },
  computed: {
  },
  created: async function() {
    window.addEventListener('resize', () => {
      this.resizeBoard();
    })

    await setTimeout(this.resizeBoard, 10);
    this.game = new BallDemo(this.boardWidth);
  },
  methods: {
    runCastlingTest() {
      this.game.click(65)
      this.game.click(66)

      this.game.click(70)
      this.game.click(68)

      this.game.click(66)
      this.game.click(67)

      this.game.click(54)
      this.game.click(52)

      this.game.click(49)
      this.game.click(50)

      this.game.click(38)
      this.game.click(36)

      this.game.click(50)
      this.game.click(51)

      this.game.click(23)
      this.game.click(5)

      this.game.click(96)
      this.game.click(114)

      this.game.click(39)
      this.game.click(99)

      this.game.click(80)
      this.game.click(65)

      this.game.click(55)
      this.game.click(4)
      
    },
    runCheckTest() {
      this.game.click(65)
      this.game.click(66)

      this.game.click(70)
      this.game.click(68)

      this.game.click(66)
      this.game.click(67)

      this.game.click(54)
      this.game.click(52)

      this.game.click(49)
      this.game.click(50)

      this.game.click(38)
      this.game.click(36)

      this.game.click(50)
      this.game.click(51)

      this.game.click(23)
      this.game.click(5)

      this.game.click(96)
      this.game.click(114)

      this.game.click(39)
      this.game.click(99)

      this.game.click(80)
      this.game.click(65)

      this.game.click(55)
      this.game.click(4)
      
      this.game.click(65)
      this.game.click(20)
      
    },
    showCoords(e) {
      this.x = e.offsetX;
      this.y = e.offsetY;
    },
    click() {
      this.game.click([this.x, this.y]);
    },
    resizeBoard() {
      let width = document.getElementById('game-container').scrollWidth;
      this.boardWidth = width;
      this.game.resize(width);
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
