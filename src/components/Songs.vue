

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    <p class="text-muted">{{ songs.length }} {{ songs.length | pluralize('song') }}, {{ duration | humanize }}</p>

    <b-table :items="songs" :fields="fields" outlined hover v-on:row-clicked="clicked">
      <template slot="attributes.artwork" slot-scope="data">
        <img v-if="data.value && data.value.artwork"
             :src="formatArtworkURL(data.value.artwork, 40, 40)"
             :class="{ 'playing': data.value.playing }" />
      </template>

      <template slot="name" slot-scope="data">
        <span class="font-weight-bold">{{ data.item.attributes.name }}</span>
        <br>
        <span>{{ data.item.attributes.artistName }}</span>
      </template>

      <template slot="actions" slot-scope="data">
        <b-button-group size="sm">
          <b-button variant="link"
                    v-if="!data.item.type.startsWith('library')"
                    v-on:click.prevent.stop="addToLibrary(data)">
            <i class="fa fa-plus" />
          </b-button>
        </b-button-group>
      </template>
    </b-table>
  </div>
</template>

<script>
import EventBus from '../event-bus';
import moment from 'moment';

export default {
  name: 'Songs',
  props: {
    title: String,
    songs: Array
  },
  computed: {
    duration: function() {
      return this.songs.reduce((total, song) => total + song.attributes.durationInMillis, 0);
    }
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
      nowPlayingItem: musicKit.player.nowPlayingItem,
      fields: [ ]
    };
  },
  methods: {
    formatArtworkURL: function(url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    },
    formatDuration: function(value, unit) {
        let pad = function(num) {
          if (num < 10) {
              num = "0" + num;
          }

          return num;
        };

        let m = moment.duration(value, unit);

        return m.minutes() + ":" + pad(m.seconds());
    },
    clicked: function(item, index, event) {
      this.queue(item);
    },
    queue: function(item) {
      EventBus.$emit('queue', { items: this.songs.map(i => {
        return {
          attributes: i.attributes,
          id: i.id,
          container: {
            id: i.id,
            name: "library-song"
          }
        }
      }), startPosition: this.songs.indexOf(item) });
    },
    addToLibrary: function(item) {
      EventBus.$emit('addToLibrary', {
        songs: [ item.item.id ]
      }, item.item.attributes.name);
    }
  },
  created: function() {
    this.fields = [
      { key: 'attributes.artwork', label: '', tdClass: 'song-cell', formatter: (value, key, item) => {
        return { 
          playing: this.nowPlayingItem
            ? item.id === this.nowPlayingItem.id || item.id === this.nowPlayingItem.container.id || item.id === this.nowPlayingItem.sourceId
            : false,
          artwork: value
        };
      } },
      { key: 'name', label: 'Title<br>Artist', tdClass: 'song-cell' },
      { key: 'attributes.albumName', label: 'Album', tdClass: 'song-cell' },
      { key: 'attributes.durationInMillis', label: 'Time', tdClass: 'song-cell', formatter: (value, key, item) => this.formatDuration(value) },
      { key: 'actions', label: '', tdClass: 'actions-cell' }
    ];

    this.mediaItemDidChange = (event) => {
      this.nowPlayingItem = event.item;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
  },
  destroyed: function() {
    this.musicKit.removeEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  background: #fefefe;
}

img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

img.playing {
  border: 2px solid #007bff;
}

</style>

<style>
.song-cell, .actions-cell {
  vertical-align: middle !important;
  cursor: pointer;
}
</style>
