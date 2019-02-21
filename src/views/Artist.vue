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

    <!-- Show error message if we failed to load -->
    <error-message v-if="error" :error="error" :show="!artist || albums.length === 0" />

    <!-- Show loader -->
    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import SongCollectionItem from '../components/collections/SongCollectionItem';
import ErrorMessage from '../components/utils/ErrorMessage';
import Loader from '../components/utils/Loader';

export default {
  name: 'Artist',
  components: {
    SongCollectionItem,
    ErrorMessage,
    Loader
  },
  props: {
    title: String
  },
  data () {
    return {
      loading: true,
      error: null,
      artist: null,
      albums: []
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    async fetch () {
      // Load the collection
      this.loading = true;
      this.artist = null;
      this.albums = [];
      this.error = null;

      try {
        this.artist = await this.$store.getters['musicKit/get'](this.$route.meta.isLibrary, this.$route.meta.type, this.$route.params.id);

        // Load albums (used to do this in one step, but something changed...)
        this.albums = await this.$store.getters['musicKit/get'](this.$route.meta.isLibrary, this.$route.meta.type, this.$route.params.id, { include: 'albums' });

        // Load additional albums, if there are any
        var albumsRelationship = this.artist.relationships.albums;
        while (albumsRelationship.next) {
          albumsRelationship = await this.$store.getters['musicKit/fetch'](albumsRelationship.next);
          this.albums = this.albums.concat(albumsRelationship.data);
        }
      } catch (err) {
        this.error = err;
      }

      this.loading = false;
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

.loading {
  margin-top: 20px;
}
</style>
