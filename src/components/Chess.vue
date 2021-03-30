<template>
  <div class="md-layout md-gutter">
    <div class="md-layout-item md-layout md-gutter md-alignment-top-center">
      <div id="game-container" class="md-layout-item md-size-60">
        <canvas @click="click" @mousemove="showCoords" id="chess" ref="chess" style="border: 1px solid black" />
        <div v-if="game != null">
          Current Turn: {{ playerTurn }}
          <div v-if="game.playerInCheck" style="color: red">
            Player is in check
          </div>
          <div>
            <button v-if="game" @click="game.resetGame()">Reset</button>
            <button v-else>Reset</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChessGame from './Chess.js'
export default {
  name: 'Game',
  props: {
    
  },
  data: function() {
    return {
      loaded: false,
      boardWidth: 200,
      game: null,
      x: 0,
      y: 0,
      aiGame: null
    }
  },
  computed: {
    playerTurn: function() {
      if (this.game.playerTurn == 0)
        return 'Black'
      else
        return 'White'
    },
    tileWidth: function() {
      return this.boardWidth / 8
    }
  },
  created: async function() {
    window.addEventListener('resize', () => {
      this.resizeBoard();
    })

    await setTimeout(this.resizeBoard, 100);
    this.game = new ChessGame(this.boardWidth);
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
      let x = Math.floor(this.x / this.tileWidth) * 16
      let y = Math.floor(this.y / this.tileWidth)
      this.game.click(x + y)
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
