
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <Songs :songs="songs" v-if="songs" />
    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import Songs from '../components/Songs.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyAlbums',
  components: {
    Songs,
    Loading
  },
  props: {
    title: String
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      songs: null
    };
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
      }

      this.musicKit.api.library.songs(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.songs) {
            this.songs = r;
          } else {
            this.songs = this.songs.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
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
    this.fetch();
  },
  destroyed: function () {
    this.abort = true;
  }
};
</script>
