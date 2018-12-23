<template>
  <div class="group">
    <h1 class="sr-only">For You</h1>

    <recommendations :recommendations="recommendations" />

    <error-message v-if="error" :error="error" :show="!recommendations || recommendations.length === 0" />
    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import Recommendations from '../components/recommendations/Recommendations';

export default {
  name: 'ForYou',
  components: {
    Loader,
    ErrorMessage,
    Recommendations
  },
  data () {
    return {
      error: null,
      loading: true,
      recommendations: []
    };
  },
  methods: {
    async fetch () {
      this.loading = true;
      this.error = null;

      try {
        this.recommendations = await this.$store.getters['musicKit/recommendations'];
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.error = err;
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
  margin: 40px;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
  text-align: center;
}
</style>
