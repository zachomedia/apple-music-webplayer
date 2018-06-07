

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    <p class="text-muted">{{ albums.length }} {{ albums.length | pluralize('album') }}</p>

    <div class="grid">
      <div class="item" v-for="album in albums" :key="album.id">
        <a href="#" v-on:click.prevent="clicked(album)">
          <img :src="formatArtworkURL(album.attributes.artwork)" alt="" />

          <span>{{ album.attributes.name }}</span>
          <span class="text-muted">{{ album.attributes.artistName }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'Albums',
  props: {
    title: String,
    albums: Array
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
    clicked: function(album) {
      EventBus.$emit('load', { album: album.id });
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

.item img {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  margin-bottom: 4px;
  box-shadow: 0 0 1px rgba(0, 0, 0, .4);
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
