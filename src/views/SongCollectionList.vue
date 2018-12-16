<template>
  <div class="list">
    <h1 v-if="title" class="sr-only">{{ title }}</h1>
    <songs :songs="collection" v-if="$route.meta.type === 'songs'" class="songs" />
    <div class="items" v-else>
      <song-collection-item
        class="item"
        v-for="item in collection"
        :key="item.id"
        :item="item" />
    </div>

    <loader v-if="loading" />
  </div>
</template>

<script>
import Loader from '../components/utils/Loader';
import Songs from '../components/collections/Songs';
import SongCollectionItem from '../components/collections/SongCollectionItem';
import mergeWith from 'lodash.mergewith';

export default {
  name: 'SongCollectionList',
  components: {
    Loader,
    Songs,
    SongCollectionItem
  },
  props: {
    title: String
  },
  data () {
    return {
      loading: true,
      collection: null
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
      this.collection = [];
      this.loading = true;

      let options = {
        limit: 100
      };
      try {
        for (var offset = 0, res = null; res === null || res.length !== 0; offset += options.limit) {
          res = await musicKitAPI[this.$route.meta.type](this.$route.params.id, mergeWith(options, { offset: offset }));
          this.collection = this.collection.concat(res);
        }
      } catch (err) {
        console.error(err);
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
  margin: 25px 30px;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
}

.songs {
  max-width: 1200px;
  margin: 0 auto;
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
