<template>
  <div class="list">
    <h1 v-if="title" class="sr-only">{{ title }}</h1>
    <artists-list :artists="collection" />
  </div>
</template>

<script>
import ArtistsList from '../components/collections/Artists';
import mergeWith from 'lodash.mergewith';

export default {
  name: 'Artists',
  components: {
    ArtistsList
  },
  props: {
    title: String
  },
  data () {
    return {
      collection: []
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    async fetch () {
      // Load MusicKit
      const instance = window.MusicKit.getInstance();

      // Select the appropriate API based on the route's meta information
      const musicKitAPI = this.$route.meta.isLibrary ? instance.api.library : instance.api;

      // Load the collection
      this.collection = [];

      let options = {
        limit: 100
      };
      try {
        for (var offset = 0, res = null; res === null || res.length !== 0; offset += options.limit) {
          res = await musicKitAPI.artists(null, mergeWith(options, { offset: offset }));
          this.collection = this.collection.concat(res);
        }
      } catch (err) {
        console.error(err);
      }
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>

</style>
