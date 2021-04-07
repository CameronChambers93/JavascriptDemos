<template>
  <div
    class="flex flex-col absolute w-64 h-auto pin-r pin-b bg-grey-darkest text-white rounded mr-2 mb-2 z-10"
  >
    <div class="p-2 mt-1">
      Controls - Press ESC for Menu
    </div>
    <div
      class="bg-grey-dark h-full p-3 rounded-b flex flex-col border border-grey-darkest"
    >
      <div class="border-b border-grey-darkest mb-2 pb-2">
        <p class="mb-1 text-grey-light font-bold">
          Scenery
        </p>
        <div class="flex">
          <p class="flex items-center justify-between mb-1">
            Size
          </p>
          <div>
            <button @click="$emit('sizedecrease')">-</button>
            {{ size }}
            <button @click="$emit('sizeincrease')">+</button>
          </div>
        </div>
        <div class="flex">
          <p class="flex items-center justify-between mb-1">
            Units
          </p>
          <div>
            <button @click="$emit('removeunit')">-</button>
            {{ units }}
            <button @click="$emit('addunit')">+</button>
          </div>
        </div>
        <p class="flex items-center justify-between">
          Axis Lines
          <input
            type="checkbox"
            name="axis-lines"
            id="axis-lines"
            v-model="axisLinesVisible"
            @click="toggleAxisLines"
          />
        </p>
      </div>
      <div
        v-if="CAMERA_POSITION"
        class="border-b border-grey-darkest mb-2 pb-2"
      >
        <p class="mb-1 text-grey-light font-bold">
          Camera Position
        </p>
        <p class="flex justify-between w-full mb-2 text-grey-light">
          X:<span class="text-white">{{ CAMERA_POSITION.x }}</span>
        </p>
        <p class="flex justify-between w-full mb-2 text-grey-light">
          Y:<span class="text-white">{{ CAMERA_POSITION.y }}</span>
        </p>
        <p class="flex justify-between w-full mb-2 text-grey-light">
          Z:<span class="text-white">{{ CAMERA_POSITION.z }}</span>
        </p>
        <p class="flex items-center">
          <button
            class="bg-grey-light cursor-pointer shadow p-2 mx-auto"
            @click="resetCameraPosition"
          >
            Reset Camera
          </button>
          <button
            class="bg-grey-light cursor-pointer shadow p-2 mx-auto"
            @click="$emit('reset')"
          >
            Reset Demo
          </button>
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  props: {
    size: {
      default: 25,
      type: Number
    },
    units: {
      default: 20,
      type: Number
    }
  },
  created() {

  },
  data() {
    return {
      axisLinesVisible: true,
      pyramidsVisible: true
    };
  },
  computed: {
    ...mapGetters(["CAMERA_POSITION"])
  },
  methods: {
    ...mapMutations([
      "SET_CAMERA_POSITION",
      "RESET_CAMERA_ROTATION",
      "HIDE_AXIS_LINES",
      "SHOW_AXIS_LINES",
      "HIDE_PYRAMIDS",
      "SHOW_PYRAMIDS"
    ]),
    resetCameraPosition() {
      this.SET_CAMERA_POSITION({ x: 0, y: 0, z: 500 });
      this.RESET_CAMERA_ROTATION();
    },
    toggleAxisLines() {
      if (this.axisLinesVisible) {
        this.HIDE_AXIS_LINES();
        this.axisLinesVisible = false;
      } else {
        this.SHOW_AXIS_LINES();
        this.axisLinesVisible = true;
      }
    },
    togglePyramids() {
      if (this.pyramidsVisible) {
        this.HIDE_PYRAMIDS();
        this.pyramidsVisible = false;
      } else {
        this.SHOW_PYRAMIDS();
        this.pyramidsVisible = true;
      }
    }
  }
};
</script>
<style scoped>
@import 'https://cdn.jsdelivr.net/npm/tailwindcss@0.7.4/dist/tailwind.css'

</style>