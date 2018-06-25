

<template>
  <div>
    <h1 v-if="artist">{{ artist.attributes.name }}</h1>

    <SongCollectionsList :items="artist.relationships.albums.data" showCount countLabel="album" v-if="artist" />
    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import SongCollectionsList from '../components/SongCollectionList.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'Artist',
  components: {
    SongCollectionsList,
    Loading
  },
  props: {
    title: String
  },
  filters: {
    humanize: function(value, unit) {
      return moment.duration(value, unit).humanize();
    }
  },
  data: function() {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      artist: null
    };
  },
  methods: {
    formatArtworkURL: function(url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    },
    fetch: function(offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
      }

      let api = this.$route.meta.isLibrary ? this.musicKit.api.library : this.musicKit.api;

      api.artist(this.$route.params.id, {
        include: 'albums'
      }).then(r => {
        this.artist = r;

        document.title = this.artist.attributes.name + ' | Zachary Seguin Music';

        this.loading = false;
        // TODO: Load > 100 albums
      }, err => {
        console.error(err);
      });
    }
  },
  created: function() {
    this.fetch();
  },
  destroyed: function() {
    this.abort = true;
  }
}
</script>
