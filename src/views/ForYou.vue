<template>
  <div class="group">
    <h1 class="sr-only">For You</h1>

    <recommendations :recommendations="recommendations" />
  </div>
</template>

<script>
import Recommendations from '../components/recommendations/Recommendations';

export default {
  name: 'ForYou',
  components: {
    Recommendations
  },
  data () {
    return {
      recommendations: []
    };
  },
  created () {
    this.$store.getters['musicKit/recommendations'].then(recommendations => {
      this.recommendations = recommendations;
    }, err => {
      console.error('got error', err);
    });
  }
};
</script>

<style lang="scss" scoped>

</style>
