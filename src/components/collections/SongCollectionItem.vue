<template>
  <div class="item">
    <router-link :to="{ name: item.type, params: { storefront: storefront, id: item.id } }">
      <lazy-img v-if="item.attributes.artwork"
          :src="item.attributes.artwork | formatArtworkURL(175)"
          alt="" />
      <div class="artwork-placeholder" v-else></div>

      <div class="primary-info">
        <p class="name" :title="item.attributes.name">{{ item.attributes.name }}</p>
        <content-rating class="content-rating" :rating="item.attributes.contentRating" />
      </div>
      <p class="text-muted text-small" :title="item.attributes.curatorName || item.attributes.artistName">{{ item.attributes.curatorName || item.attributes.artistName }}</p>

      <div v-if="description" class="description" :style="{ background: bgColor, color: textColor1 }" v-b-popover.hover.focus.bottom="description">
        <i class="fa fa-info"><span class="sr-only">Description</span></i>
      </div>

      <button class="play-button" v-on:click.stop.prevent="play(item)">
        <i class="fa fa-play"></i>
      </button>
    </router-link>
  </div>
</template>

<script>
import LazyImg from '../utils/LazyImg';
import ContentRating from '../utils/ContentRating';
import { formatArtworkURL, playItem } from '../../utils';

import { mapState } from 'vuex';

export default {
  name: 'SongitemItem',
  components: {
    ContentRating,
    LazyImg
  },
  filters: {
    formatArtworkURL
  },
  props: {
    item: Object
  },
  computed: {
    ...mapState('musicKit', ['storefront']),
    description () {
      let description = this.item.attributes.description || {};
      return description.short || description.standard;
    },
    bgColor () {
      let item = this.item;

      if (item.attributes.artwork && item.attributes.artwork.bgColor) {
        return `#${item.attributes.artwork.bgColor}`;
      }

      return '#ffffff';
    },
    textColor1 () {
      let item = this.item;

      if (item.attributes.artwork && item.attributes.artwork.textColor1) {
        return `#${item.attributes.artwork.textColor1}`;
      }

      return '#000000';
    }
  },
  methods: {
    play: playItem
  }
};
</script>

<style lang="scss" scoped>
$imgSize: 175px;

.item {
  width: $imgSize;
  min-height: $imgSize;
  position: relative;
}

img, .artwork-placeholder {
  display: block;
  width: $imgSize;
  height: $imgSize;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 4px;
  box-shadow: 0 0 2px rgba(0, 0, 0, .6);
}

a {
  color: white;
}

a:hover {
  color: #ccc;
  text-decoration: none;
}

p {
  padding: 0;
  margin: 0;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-small {
  font-size: 0.85rem;
}

.item .description {
  position: absolute;
  top: 150px;
  right: 5px;
  width: 20px;
  height: 20px;
  line-height: 20px;
  margin: 0;
  text-align: center;
  color: white;
  border-radius: 3px;
  opacity: 0.75;
  font-size: 10px;
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
  top: 134px;
  width: 32px;
}

.item .play-button:active {
  background-color: rgba(220, 220, 220, 0.8);
}

.item:hover .play-button {
  display: block;
}

.primary-info {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  .name {
    flex: 1;
  }

  .content-rating {
    flex: none;
    align-self: center;
    padding: 0;
  }
}
</style>
