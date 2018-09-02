
<template>
  <div>
    <p class="text-muted" v-if="showCount">{{ items.length }} {{ items.length | pluralize(countLabel || 'item') }}</p>

    <div class="grid">
      <div class="item" v-for="item in items" :key="item.id">
        <router-link :to="{ name: item.type, params: { id: item.id } }">
          <lazy-img v-if="item.attributes.artwork"
                    :src="item.attributes.artwork | formatArtworkURL(200)"
                    alt="" />
          <div class="artwork-placeholder" v-else></div>

          <span>{{ item.attributes.name }}</span>
          <span class="text-muted">{{ item.attributes.curatorName || item.attributes.artistName }}</span>
        </router-link>
        <button class="play-button" v-on:click="play(item)">
          <i class="fa fa-play"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LazyImg from './LazyImg';
import {formatArtworkURL, playItem} from '../utils';

export default {
  name: 'SongCollectionList',
  components: {LazyImg},
  filters: {
    formatArtworkURL
  },
  props: {
    showCount: Boolean,
    countLabel: String,
    items: Array
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      fields: [ ]
    };
  },
  methods: {
    play: playItem
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
  position: relative;
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

.item .play-button {
  background-color: rgba(255, 255, 255, .8);
  border: none;
  border-radius: 50%;
  color: #2e8af7;
  display: none;
  font-size: 18px;
  height: 32px;
  left: 10px;
  line-height: 32px;
  outline: none;
  padding-left: 9px;
  position: absolute;
  top: 158px;
  width: 32px;
}

.item .play-button:active {
  background-color: rgba(220, 220, 220, 0.8);
}

.item:hover .play-button {
  display: block;
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
