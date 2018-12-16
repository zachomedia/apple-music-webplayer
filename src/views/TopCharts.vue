<template>
  <div class="charts">
    <b-alert v-if="!isAuthorized" variant="info" show>
      <b-button variant="primary" @click="authorize()">Sign in</b-button> now for full length tracks and access to your Apple Music library.
    </b-alert>

    <h1 class="sr-only">Top charts</h1>
    <Loader v-if="loading" class="loading" />

    <h2 v-if="charts && charts.playlists && charts.playlists[0]" class="h5">{{ charts.playlists[0].name }}</h2>
    <song-collection-list v-if="charts && charts.playlists && charts.playlists[0]" :collection="charts.playlists[0].data" />

    <h2 v-if="charts && charts.albums && charts.albums[0]" class="h5">{{ charts.albums[0].name }}</h2>
    <song-collection-list v-if="charts && charts.albums && charts.albums[0]" :collection="charts.albums[0].data" />

    <h2 v-if="charts && charts.songs && charts.songs[0]" class="h5">{{ charts.songs[0].name }}</h2>
    <songs v-if="charts && charts.songs && charts.songs[0]" :songs="charts.songs[0].data" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Loader from '../components/utils/Loader';
import SongCollectionList from '../components/collections/SongCollectionList';
import Songs from '../components/collections/Songs';

export default {
  name: 'TopCharts',
  components: {
    Loader,
    SongCollectionList,
    Songs
  },
  data () {
    return {
      loading: true,
      charts: null
    };
  },
  computed: {
    ...mapState('musicKit', ['isAuthorized'])
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    authorize () {
      let instance = window.MusicKit.getInstance();
      instance.authorize();
    },
    async fetch () {
      let instance = window.MusicKit.getInstance();
      let api = instance.api;

      this.loading = true;
      this.charts = null;

      try {
        this.charts = await api.charts(null, {
          types: [ 'songs', 'albums', 'playlists' ],
          limit: 10
        });
        this.loading = false;
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
.loading, .charts {
  margin: 20px !important;
}

h2 {
  color: #ddd;
  font-weight: bold;
}
</style>
