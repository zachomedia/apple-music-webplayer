<template>
  <div class="charts">
    <h1 class="sr-only">Top charts</h1>

    <h2 v-if="charts && charts.playlists && charts.playlists[0]" class="h5">{{ charts.playlists[0].name }}</h2>
    <song-collection-list v-if="charts && charts.playlists && charts.playlists[0]" :collection="charts.playlists[0].data" />

    <h2 v-if="charts && charts.albums && charts.albums[0]" class="h5">{{ charts.albums[0].name }}</h2>
    <song-collection-list v-if="charts && charts.albums && charts.albums[0]" :collection="charts.albums[0].data" />

    <h2 v-if="charts && charts.songs && charts.songs[0]" class="h5">{{ charts.songs[0].name }}</h2>
    <songs v-if="charts && charts.songs && charts.songs[0]" :songs="charts.songs[0].data" class="songs" />

    <error-message v-if="error" :error="error" />
    <loader v-if="loading" class="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import SongCollectionList from '../components/collections/SongCollectionList';
import Songs from '../components/collections/Songs';

export default {
  name: 'TopCharts',
  components: {
    Loader,
    ErrorMessage,
    SongCollectionList,
    Songs
  },
  data () {
    return {
      error: null,
      loading: true,
      charts: null
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    async fetch () {
      this.loading = true;
      this.error = null;
      this.charts = null;

      try {
        this.charts = await this.$store.getters['musicKit/get'](false, 'charts', null, {
          types: [ 'songs', 'albums', 'playlists' ],
          limit: 10
        });

        this.loading = false;
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.error = err;
      }
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>
.loading, .charts {
  margin: 20px !important;
}

h2 {
  color: #ddd;
  font-weight: bold;
}
</style>
