<template>
  <div>
    <div class="list">
      <router-link :to="{ name: artist.type, params: { storefront: storefront, id: artist.id } }" v-for="artist in artists" :key="artist.id" class="item">
        <span :title="artist.attributes.name">{{ artist.attributes.name }}</span>
      </router-link>
    </div>

    <div class="loading" v-if="loading">
      <loader />
    </div>
    <div class="load-more" v-else-if="loadMore">
      <b-btn variant="link" v-on:click="loadMore()">
        <div class="text-center"><i class="fa fa-ellipsis-h"><span class="sr-only">Load more</span></i></div>
      </b-btn>
    </div>
  </div>
</template>

<script>
import Loader from '../utils/Loader';

import { mapState } from 'vuex';

export default {
  name: 'Artists',
  computed: {
    ...mapState('musicKit', ['storefront'])
  },
  props: {
    artists: Array,
    loading: Boolean,
    loadMore: Function
  },
  components: {
    Loader
  }
};
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;

  .item {
    padding: 8px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.load-more {
  display: flex;
  margin: 20px 0;
  margin-right: 15px;

  a, button { color: white; font-size: 20px; }
  a:hover, button:hover { color: #aaa; }
  text-align: center;

}
</style>
