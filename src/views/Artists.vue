<template>
  <div class="list">
    <h1 v-if="title" class="sr-only">{{ title }}</h1>
    <artists-list :artists="collection" />

    <error-message v-if="error" :error="error" :show="!collection || collection.length == 0" />
    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import ArtistsList from '../components/collections/Artists';
import mergeWith from 'lodash.mergewith';

export default {
  name: 'Artists',
  components: {
    Loader,
    ErrorMessage,
    ArtistsList
  },
  props: {
    title: String
  },
  data () {
    return {
      error: null,
      loading: true,
      collection: []
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    async fetch () {
      // Load the collection
      this.loading = true;
      this.error = null;
      this.collection = [];

      let options = {
        limit: 100
      };
      try {
        for (var offset = 0, res = null; res === null || res.length !== 0; offset += options.limit) {
          res = await this.$store.getters['musicKit/get'](this.$route.meta.isLibrary, 'artists', null, mergeWith(options, { offset: offset }));
          this.collection = this.collection.concat(res);
        }
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
  margin-top: 20px;
}
</style>
