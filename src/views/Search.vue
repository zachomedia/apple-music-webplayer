
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <SearchBox class="mb-2" />
    <SearchResults :results="results" v-if="results" />
    <Loading message="Searching" v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';
import SearchBox from '../components/SearchBox.vue';
import SearchResults from '../components/SearchResults.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'Search',
  props: {
    title: String
  },
  components: {
    SearchBox,
    SearchResults,
    Loading
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      loading: false,
      hasQuery: false,
      results: null
    };
  },
  watch: {
    '$route': 'search'
  },
  methods: {
    search: function () {
      // Don't search, if we don't have a query
      this.hasQuery = this.$route.query.q !== undefined && this.$route.query.q.length > 0;

      // Clear results if we don't have a query
      if (!this.hasQuery) {
        this.results = null;
        return;
      }

      // The query hasn't changed, don't search
      if (this.lastQuery && this.lastQuery === this.$route.query.q) {
        return;
      }
      this.lastQuery = this.$route.query.q;

      this.loading = true;
      this.results = null;

      let types = [ 'songs', 'albums', 'artists', 'playlists' ];
      if (this.$route.meta.isLibrary) {
        types = types.map(i => 'library-' + i);
      }

      let api = this.$route.meta.isLibrary ? this.musicKit.api.library : this.musicKit.api;

      api.search(this.$route.query.q, {
        types,
        limit: 20
      }).then(r => {
        for (var key in r) {
          if (key.startsWith('library-')) {
            r[key.replace('library-', '')] = r[key];
            delete (r[key]);
          }
        }

        this.results = r;
        this.loading = false;
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An unexpected error occurred.`
        });
      });
    }
  },
  created: function () {
    this.search();
  }
};
</script>
