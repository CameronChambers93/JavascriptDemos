<template>
  <div class="md-layout md-gutter">
    <div class="md-layout-item md-layout md-gutter md-alignment-top-center">
        <div class="md-layout-item md-size-100">
            <h1>Spatial HashGrid Benchmarks</h1>
            <div v-if="loading">
                Loading tests, please wait....
            </div>

            <div v-else>
                <h3>Results</h3>
                <div v-html="results" />
                <md-button @click="rerun()">Run Tests Again</md-button>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
import SpatialHashGridTester from './SpatialHashGridTester.js'
export default {
  name: 'HashGridBenchmarks',
  props: {
  },
  data: function() {
    return {
        tester: null,
        loading: true,
        results: ""
    }
  },
  computed: {
  },
  mounted() {

  },
  created: function() {
      setTimeout(this.createTester, 100);
  },
  methods: {
      async rerun() {
          this.loading = true;
          this.results = "";
          setTimeout(this.createTester, 100);
      },
      async createTester() {
            SpatialHashGridTester.test().then((results) => {
                this.loading = false;
                this.results = results;
            });
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
