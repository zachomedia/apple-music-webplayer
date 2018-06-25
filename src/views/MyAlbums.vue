

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <SongCollectionList :items="albums" showCount countLabel="album" v-if="albums" />
    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import EventBus from '../event-bus';

import SongCollectionList from '../components/SongCollectionList.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'MyAlbums',
  components: {
    SongCollectionList,
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
      albums: null
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

      this.musicKit.api.library.albums(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.albums) {
            this.albums = r;
          } else {
            this.albums = this.albums.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a:hover {
  text-decoration: none;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.grid .item {
  width: 200px;
  margin: 5px;
  font-size: 0.9em;
}

.item img {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-bottom: 4px;
  box-shadow: 0 0 1px rgba(0, 0, 0, .4);
}

.item span {
  display: block;
  padding: 1px 6px;
  color: black;
}
</style>

<style>
.song-cell {
  vertical-align: middle !important;
  cursor: pointer;
}
</style>
