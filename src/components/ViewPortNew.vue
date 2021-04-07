<template>
  <div class="viewport"/>
</template>
<script>
import { mapMutations, mapActions } from "vuex";
import BallDemo3D from './BallDemo3D.js'

export default {
  props: {
    _size: {
      default: 25,
      type: Number
    }
  },
  data () {
    return {
      height: 400,
      refreshInterval: null,
      currentGameId: 0,
      size: 25,
      reset: false,
    };
  },
  methods: {
    ...mapMutations(["RESIZE"]),
    ...mapActions(["INIT", "ANIMATE", "SET_PIECE", "RESIZE_PIECES", "REMOVE_LAST_UNIT", "RESET_STATE"]),
    async loop() {
      let pieces = this.game.pieces;
      let resize = -1;
      let reset = this.reset;
      if (pieces.size != this._size) {
        this.game.pieceSize = this._size;
        resize = this._size;
      }
      this.SET_PIECE({pieces, resize, reset}).then(() => {
        this.ANIMATE().then(() => {
          setTimeout(() => {
            this.loop();
          }, 50);
        })
      });
    },
    addUnit() {
      this.game.addPieceFromClient();
    },
    removeUnit() {
      this.game.removePieceFromClient();
      let piece = this.game.pieces;
      this.REMOVE_LAST_UNIT({ pieces: piece })
    },
    resetDemo() {
      this.game.resetGame(20);
      //this.reset = true;
    }
  },
  mounted () {
    this.game = new BallDemo3D(this.height);
    let piece = this.game.pieces;
    this.$emit('setsize', 80)
    this.INIT({
      width: this.$el.offsetWidth,
      height: this.$el.offsetHeight,
      el: this.$el,
      piece: piece
    }).then(() => {
      this.loop();
      window.addEventListener("resize", () => {
        this.RESIZE({
          width: this.$el.offsetWidth,
          height: this.$el.offsetHeight
        });
      });
    });
  },
  created() {
  },
  beforeDestroy() {
    this.game.stop();
    this.RESET_STATE();
  }
};
</script>
<style>
.viewport {
    height: 100%;
    width: 100%;
}
</style>