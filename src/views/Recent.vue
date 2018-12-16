<template>
  <div class="recent">
    <h1 class="sr-only">Recent</h1>

    <h2 class="h4">Recently played</h2>
    <song-collection-list :collection="played" />
    <loader v-if="loadingPlayed" class="loading" />

    <hr />

    <h2 class="h4">Recently added</h2>
    <song-collection-list :collection="added" />
    <loader v-if="loadingPlayed" class="loading" />
  </div>
</template>

<script>
// import { mapState } from 'vuex';

import Loader from '../components/utils/Loader';
import SongCollectionList from '../components/collections/SongCollectionList';

import mergeWith from 'lodash.mergewith';

const tabs = {
  1: 'added',
  0: 'played',
  added: 1,
  played: 0
};

export default {
  name: 'Recent',
  components: {
    Loader,
    SongCollectionList
  },
  data () {
    return {
      loadingAdded: true,
      loadingPlayed: false,
      added: [],
      played: [],
      tabIndex: parseInt(tabs[this.$route.query.view], 10) || 0
    };
  },
  computed: {
    loading () {
      return this.loadingAdded || this.loadingPlayed;
    }
  },
  watch: {
    '$route': function () {
      this.tabIndex = parseInt(tabs[this.$route.query.view], 10) || 0;
    },
    tabIndex: function () {
      var route = {
        name: this.$route.name,
        params: this.$route.params,
        query: {
          view: tabs[this.tabIndex]
        }
      };
      this.$router.push(route);
    }
  },
  methods: {
    async fetchAdded () {
      // Load MusicKit
      const instance = window.MusicKit.getInstance();

      // Select the appropriate API based on the route's meta information
      const musicKitAPI = instance.api.library;

      // Load the collection
      this.added = [];
      this.loadingAdded = true;

      let options = {
        limit: 10
      };
      try {
        for (var offset = 0, res = null; (res === null || res.length !== 0); offset += options.limit) {
          res = await musicKitAPI.collection('recently-added', null, mergeWith(options, { offset: offset }));
          this.added = this.added.concat(res);
        }
      } catch (err) {
        console.error(err);
      }

      this.loadingAdded = false;
    },
    async fetchPlayed () {
      // Load MusicKit
      const instance = window.MusicKit.getInstance();

      // Select the appropriate API based on the route's meta information
      const musicKitAPI = instance.api;

      // Load the collection
      this.played = [];
      this.loadingPlayed = true;

      try {
        var res = await musicKitAPI.recentPlayed();
        this.played = this.played.concat(res);
      } catch (err) {
        console.error(err);
      }

      this.loadingPlayed = false;
    },
    fetch () {
      this.fetchAdded();
      this.fetchPlayed();
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
</style>
