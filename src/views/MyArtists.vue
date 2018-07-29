
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <Artists :artists="artists" v-if="artists" />
    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import EventBus from '../event-bus';

import Artists from '../components/Artists.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyArtists',
  components: {
    Artists,
    Loading
  },
  props: {
    title: String
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      artists: null
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

      this.musicKit.api.library.artists(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.artists) {
            this.artists = r;
          } else {
            this.artists = this.artists.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
        }, err => {
          console.error(err);

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
