
<template>
  <div>
    <p class="text-muted" v-if="showCount">{{ items.length }} {{ items.length | pluralize(countLabel || 'item') }}</p>

    <div class="grid">
      <div class="item" v-for="item in items" :key="item.id">
        <router-link :to="{ name: item.type, params: { id: item.id } }">
          <lazy-img :src="formatArtworkURL(item.attributes.artwork)" alt="" v-if="item.attributes.artwork" />
          <div class="artwork-placeholder" v-else></div>

          <span>{{ item.attributes.name }}</span>
          <span class="text-muted">{{ item.attributes.curatorName || item.attributes.artistName }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import LazyImg from './LazyImg';

export default {
  name: 'SongCollectionList',
  components: {LazyImg},
  props: {
    showCount: Boolean,
    countLabel: String,
    items: Array
  },
  computed: {
  },
  filters: {
    humanize: function (value, unit) {
      return moment.duration(value, unit).humanize();
    }
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      fields: [ ]
    };
  },
  methods: {
    formatArtworkURL: function (url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a:hover {
  text-decoration: none !important;
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

.item img, .artwork-placeholder {
  display: block;
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 4px;
  margin-bottom: 4px;
  box-shadow: 0 0 1px rgba(0, 0, 0, .4);
}

.artwork-placeholder {
  background: #ddd;
}

.item span {
  display: block;
  padding: 1px 6px;
}
</style>

<style>
.song-cell {
  vertical-align: middle !important;
  cursor: pointer;
}
</style>
