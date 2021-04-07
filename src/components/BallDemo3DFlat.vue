<template>
  <div class="viewport">
    <controls
      :size="pieceSize"
      v-on:sizedecrease="decreaseSize()"
      v-on:sizeincrease="increaseSize()"
      v-on:removeunit="removeUnit()"
      v-on:addunit="addUnit()"
      v-on:reset="resetDemo()"
      :units="units"
    />
    <viewport 
      :ref="'viewport'"
      :_size="pieceSize"
      v-on:setsize="setPieceSize"
    />
  </div>
</template>
<script>
import ViewPort from './ViewPort.vue'
import ControlPanel from './ControlPanel.vue'

export default {
  data () {
    return {
      height: 800,
      pieceSize: 25,
      units: 20
    };
  },
  components: {
    viewport: ViewPort,
    controls: ControlPanel,
  },
  methods: {
    decreaseSize() {
      this.pieceSize--;
    },
    increaseSize() {
      this.pieceSize++;
    },
    setPieceSize(size) {
      this.pieceSize = size;
    },
    addUnit() {
      this.units++;
      let viewport = this.$refs.viewport;
      viewport.addUnit();
    },
    removeUnit() {
      this.units--;
      let viewport = this.$refs.viewport;
      viewport.removeUnit();
    },
    resetDemo() {
      let viewport = this.$refs.viewport;
      viewport.resetDemo();
    }
  },
  beforeDestroy() {

  },
  async mounted () {
  }
};
</script>
<style>
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.viewport {
    height: 100%;
    width: 100%;
}
</style>