

<template>
  <div>
    <div class="header">
      <img class="pull-left" alt="" :src="formatArtworkURL(collection.attributes.artwork, 150, 150)" v-if="collection.attributes.artwork" />
      <div class="info">
        <h1>{{ collection.attributes.name }}</h1>
        <p v-if="collection.attributes.description">{{ collection.attributes.description.standard }}</p>

        <p class="text-uppercase actions">
          <ul class="list-unstyled">
            <li><a href="#" v-on:click.prevent="queue()">Play all</a></li>
            <li><a href="#" v-on:click.prevent="shuffle()">Shuffle all</a></li>
          </ul>
        </p>
      </div>
    </div>
    
    <Songs :songs="collection.relationships.tracks.data" />
  </div>
</template>

<script>
import EventBus from '../event-bus';
import Songs from './Songs.vue';
import moment from 'moment';

export default {
  name: 'SongCollection',
  props: {
    collection: Object,
  },
  filters: {
    formattedDuration: function(value, unit) {
      return moment.duration(value, unit).humanize();
    },
  },
  components: {
    Songs
  },
  methods: {
    formatArtworkURL: function(url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    },
    queue: function() {
      var map = {
        'library-albums': 'album',
        'library-playlists': 'playlist',
        'playlists': 'playlist',
        'albums': 'album'
      }

      var desc = {};
      desc[map[this.collection.type] || this.collection.type] = this.collection.id;
      EventBus.$emit('queue', desc);
    },
    /** shuffle() is a temporary implemention until MusicKit JS shuffling works. */
    shuffle: function() {
      var tracks = this.collection.relationships.tracks.data.slice();
      tracks.sort(i => 0.5 - Math.random());

      EventBus.$emit('queue', { items: tracks.map(i => {
        return {
          attributes: i.attributes,
          id: i.id,
          container: {
            id: i.id
          }
        }
      }) });
    }
  },
  created: function() {
    this.musicKit = window.MusicKit.getInstance();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  width: 150px;
  height: 150px;
  border-radius: 4px;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

.info {
  padding-left: 170px;
}

.header {
  overflow: hidden;
  margin-bottom: 10px;
}

.actions li {
  display: inline-block;
}

.actions li::after {
  content: '|';
  padding: 5px;
  color: #333;
}

.actions li:last-child::after {
  content: '';
}
</style>
