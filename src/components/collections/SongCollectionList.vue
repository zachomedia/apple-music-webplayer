<template>
  <div class="list">
    <div class="items">
      <song-collection-item
        class="item"
        v-for="item in collection"
        :key="item.id"
        :item="item" />

      <div class="loading" v-if="loading">
        <loader class="loading" />
      </div>
      <div class="load-more" v-else-if="loadMore">
        <b-btn variant="link" v-on:click="loadMore()">
          <div class="artwork text-center"><i class="fa fa-ellipsis-h"><span class="sr-only">Load more</span></i></div>
        </b-btn>
      </div>
    </div>
  </div>
</template>

<script>
import SongCollectionItem from './SongCollectionItem';
import Loader from '../utils/Loader';

export default {
  name: 'SongCollectionList',
  components: {
    SongCollectionItem,
    Loader
  },
  props: {
    collection: Array,
    loading: Boolean,
    loadMore: Function
  }
};
</script>

<style lang="scss" scoped>
.items {
  display: flex;
  flex-wrap: wrap;

  .item {
    margin: 20px 0;
    margin-right: 15px;
  }
}

.load-more, .loading {
  display: flex;
  margin: 20px 0;
  margin-right: 15px;

  a, button { color: white; }
  a:hover, button:hover { color: #aaa; }
  text-align: center;

  .artwork {
    font-size: 40px;
  }
}

.loading {
  display: block;
  margin-top: 45px;
  margin-left: 20px;
}
</style>
