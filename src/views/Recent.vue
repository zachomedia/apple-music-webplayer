<template>
  <div class="recent">
    <h1 class="sr-only">Recent</h1>

    <h2 class="h5">Heavy rotation</h2>
    <song-collection-list :collection="heavyRotation" />
    <loader v-if="loadingPlayed" class="loading" />

    <h2 class="h5">Recently played</h2>
    <song-collection-list :collection="played" />
    <loader v-if="loadingPlayed" class="loading" />

    <h2 class="h5">Recently added</h2>
    <song-collection-list :collection="added" />
    <loader v-if="loadingPlayed" class="loading" />
  </div>
</template>

<script>
import Loader from '../components/utils/Loader';
import SongCollectionList from '../components/collections/SongCollectionList';

import mergeWith from 'lodash.mergewith';

export default {
  name: 'Recent',
  components: {
    Loader,
    SongCollectionList
  },
  data () {
    return {
      loadingAdded: true,
      loadingPlayed: true,
      loadingHeavyRotation: true,
      added: [],
      played: [],
      heavyRotation: []
    };
  },
  watch: {
    '$route': function () {
      this.fetch();
    }
  },
  methods: {
    async fetchAdded () {
      // Load the collection
      this.added = [];
      this.loadingAdded = true;

      let options = {
        limit: 10
      };
      try {
        for (var offset = 0, res = null; (res === null || res.length !== 0); offset += options.limit) {
          res = await this.$store.getters['musicKit/recentlyAdded'](mergeWith(options, { offset: offset }));
          this.added = this.added.concat(res);
        }
      } catch (err) {
        console.error(err);
      }

      this.loadingAdded = false;
    },
    async fetchPlayed () {
      // Load the collection
      this.played = [];
      this.loadingPlayed = true;

      try {
        var res = await this.$store.getters['musicKit/recentlyPlayed'];
        this.played = this.played.concat(res);
      } catch (err) {
        console.error(err);
      }

      this.loadingPlayed = false;
    },
    async fetchHeavyRotation () {
      // Load the collection
      this.heavyRotation = [];
      this.loadingHeavyRotation = true;

      try {
        var res = await this.$store.getters['musicKit/heavyRotation'];
        this.heavyRotation = this.heavyRotation.concat(res);
      } catch (err) {
        console.error(err);
      }

      this.loadingHeavyRotation = false;
    },
    fetch () {
      this.fetchAdded();
      this.fetchPlayed();
      this.fetchHeavyRotation();
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>
.loading, .recent {
  margin: 20px !important;
}

hr {
  background-color: #444;
}

h2 {
  color: #ddd;
  font-weight: bold;
}
</style>
