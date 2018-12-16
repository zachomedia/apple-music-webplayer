<template>
  <div class="group">
    <h1 class="sr-only">For You</h1>

    <recommendations :recommendations="recommendations" />

    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import Loader from '../components/utils/Loader';
import Recommendations from '../components/recommendations/Recommendations';

export default {
  name: 'ForYou',
  components: {
    Loader,
    Recommendations
  },
  data () {
    return {
      loading: true,
      recommendations: []
    };
  },
  methods: {
    async fetch () {
      this.loading = true;
      try {
        this.recommendations = await this.$store.getters['musicKit/recommendations'];
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>
.loading {
  margin-top: 40px;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
}
</style>
