<template>
  <div class="list">
    <h1 v-if="artist && artist.attributes" class="h3">{{ artist.attributes.name }}</h1>
    <div class="items">
      <song-collection-item
        class="item"
        v-for="item in albums"
        :key="item.id"
        :item="item" />
    </div>
  </div>
</template>

<script>
import SongCollectionItem from '../components/collections/SongCollectionItem';
import { apiHeaders } from '../utils';

export default {
  name: 'Artist',
  components: {
    SongCollectionItem
  },
  props: {
    title: String
  },
  data () {
    return {
      artist: null,
      albums: []
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
      this.artist = null;
      this.albums = [];
      try {
        this.artist = await musicKitAPI[this.$route.meta.type](this.$route.params.id, { include: 'albums' });
        this.albums = this.artist.relationships.albums.data;

        // Load additional albums, if there are any
        var albumsRelationship = this.artist.relationships.albums;
        while (albumsRelationship.next) {
          var res = await fetch('https://api.music.apple.com' + albumsRelationship.next, { headers: apiHeaders() });
          albumsRelationship = await res.json();
          this.albums = this.albums.concat(albumsRelationship.data);
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
.list {
  margin: 25px 30px !important;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
}

.items {
  display: flex;
  flex-wrap: wrap;

  .item {
    margin: 10px 0;
    margin-right: 25px;
  }
}
</style>
