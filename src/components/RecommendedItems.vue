

<template>
  <div>
    <p class="text-muted" v-if="showCount">{{ items.length }} {{ items.length | pluralize(countLabel || 'item') }}</p>

    <div class="grid">
      <div class="item" v-for="item in items" :key="item.id">
        <a href="#" v-on:click.prevent="clicked(item)">
          <img :src="formatArtworkURL(item.attributes.artwork)" alt="" v-if="item.attributes.artwork" />
          <div class="artwork-placeholder" v-else></div>

          <span>{{ item.attributes.name }}</span>
          <span class="text-muted">{{ item.attributes.curatorName || item.attributes.artistName }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'RecommendedItems',
  props: {
    showCount: Boolean,
    countLabel: String,
    items: Array
  },
  computed: {
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
      fields: [ ]
    };
  },
  methods: {
    formatArtworkURL: function(url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    },
    clicked: function(item) {
      if (item.type === 'playlists') {
        EventBus.$emit('load', { playlist: item.id, library: false });
      } else if (item.type === 'albums') {
        EventBus.$emit('load', { album: item.id, library: false });
      }
    }
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

.item img, .artwork-placeholder {
  width: 200px;
  height: 200px;
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
  color: black;
}
</style>

<style>
.song-cell {
  vertical-align: middle !important;
  cursor: pointer;
}
</style>
