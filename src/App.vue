<template>
  <div id="app">
    <div class="md-layout md-gutter" style="display: flex; flex-wrap: wrap; height: 100%">
      <BallDemo v-if="selection =='BALL_DEMO'" class="md-layout-item md-size-100" />
      <BallDemo3D v-if="selection == 'BALL_DEMO_3D'" class="md-layout-item md-size-100" />
      <Chess v-if="selection == 'CHESS'" class="md-layout-item md-size-100" />
      <HashGridTester v-if="selection == 'HASH_GRID_TESTER'" class="md-layout-item md-size-100" />
      <div v-if="selection == 'MENU'" class="md-layout-item md-size-100">
        <h1>Main Menu</h1>
        <div>
          <md-button v-for="(title, index) of pages" :key="index" @click="selection=title">{{ title }}</md-button>
        </div>
      </div>
      <div v-else class="md-layout-item md-size-100">
        <md-button class="md-primary" @click="selection='MENU'">Return to Menu</md-button>
      </div>
    </div>
  </div>
</template>

<script>
import Chess from './components/Chess.vue'
import BallDemo from './components/BallDemo.vue'
import BallDemo3D from './components/BallDemo3D.vue'
import HashGridTester from './components/HashGridTester.vue'

export default {
  name: 'App',
  components: {
    Chess, BallDemo, BallDemo3D, HashGridTester
  },
  data() {
    return {
      selection: 'MENU',
      pages: ['CHESS', 'BALL_DEMO', 'BALL_DEMO_3D', 'HASH_GRID_TESTER']
    }
  },
  created() {
    window.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        this.selection = "MENU";
      }
    });
  }
}
</script>

<style>
body {
  margin: 0px;
}
#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
