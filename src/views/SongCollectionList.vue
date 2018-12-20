<template>
  <div class="list">
    <h1 v-if="title" class="sr-only">{{ title }}</h1>
    <songs :songs="collection" v-if="$route.meta.type === 'songs'" class="songs" :loading="loading" />
    <div class="items" v-else>
      <song-collection-item
        class="item"
        v-for="item in collection"
        :key="item.id"
        :item="item" />
    </div>

    <error-message v-if="error" :error="error" :show="!collection || collection.length == 0" />
    <loader v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import Songs from '../components/collections/Songs';
import SongCollectionItem from '../components/collections/SongCollectionItem';
import mergeWith from 'lodash.mergewith';

export default {
  name: 'SongCollectionList',
  components: {
    Loader,
    ErrorMessage,
    Songs,
    SongCollectionItem
  },
  props: {
    title: String
  },
  data () {
    return {
      error: null,
      loading: true,
      collection: null
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    async fetch () {
      // Load the collection
      this.error = null;
      this.collection = [];
      this.loading = true;

      let options = {
        limit: 100
      };
      try {
        for (var offset = 0, res = null; res === null || res.length !== 0; offset += options.limit) {
          res = await this.$store.getters['musicKit/get'](this.$route.meta.isLibrary, this.$route.meta.type, this.$route.params.id, mergeWith(options, { offset: offset }));
          this.collection = this.collection.concat(res);
        }
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
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
