
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    <p class="text-muted">{{ songs.length }} {{ songs.length | pluralize('song') }}, {{ duration | humanize }}</p>

    <b-table :items="songs" :fields="fields" hover v-on:row-clicked="clicked">
      <template slot="attributes.artwork" slot-scope="data">
        <lazy-img v-if="data.value && data.value.artwork"
             :src="formatArtworkURL(data.value.artwork, 40, 40)"
             :class="{ 'playing': data.value.playing }" />
      </template>

      <template slot="name" slot-scope="data">
        <span class="font-weight-bold" v-if="data.item.attributes">{{ data.item.attributes.name }}</span>
        <br>
        <span v-if="showArtist && data.item.attributes">{{ data.item.attributes.artistName }}</span>
      </template>

      <template slot="actions" slot-scope="data">
        <b-dropdown variant="link" size="sm" no-caret right>
          <template slot="button-content">
            <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
          </template>

          <b-dropdown-item-button @click.stop="addToLibrary(data)" v-if="isAuthorized">Add to library</b-dropdown-item-button>
          <b-dropdown-divider  v-if="isAuthorized" />
          <b-dropdown-item-button @click.stop="queueNext(data)">Play next</b-dropdown-item-button>
          <b-dropdown-item-button @click.stop="queueLater(data)">Play later</b-dropdown-item-button>
        </b-dropdown>
      </template>
    </b-table>
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';
import moment from 'moment';
import LazyImg from './LazyImg';

export default {
  name: 'Songs',
  components: {LazyImg},
  props: {
    isAlbum: Boolean,
    title: String,
    songs: Array
  },
  computed: {
    duration: function () {
      return this.songs.reduce((total, song) => total + ((song.attributes || {}).durationInMillis || 0), 0);
    },
    showArtist: function () {
      const artist =
          this.songs.length > 0 ? this.songs[0].attributes.artistName : '';
      const allArtistsMatch =
          this.songs.every(item => item.attributes.artistName === artist);
      return !(this.isAlbum && allArtistsMatch);
    }
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
      isAuthorized: musicKit.isAuthorized,
      nowPlayingItem: musicKit.player.nowPlayingItem,
      fields: [ ]
    };
  },
  methods: {
    formatArtworkURL: function (url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    },
    formatDuration: function (value, unit) {
      let pad = function (num) {
        if (num < 10) {
          num = '0' + num;
        }

        return num;
      };

      let m = moment.duration(value, unit);

      return m.minutes() + ':' + pad(m.seconds());
    },
    clicked: function (item, index, event) {
      this.play(item);
    },
    trackToMediaItem (track) {
      return {
        attributes: track.attributes,
        id: track.id,
        container: {
          id: track.id
        }
      };
    },
    play: function (item) {
      if (this.$localStorage.get('queueAllSongs')) {
        this.musicKit.setQueue({
          items: this.songs.map(i => this.trackToMediaItem(i)),
          startPosition: this.songs.indexOf(item)
        }).then(queue => {
          this.musicKit.player.changeToMediaItem(queue.item(this.songs.indexOf(item)))
            .then(r => {
              this.musicKit.play().catch(err => console.error(err));
            }, err => {
              Raven.captureException(err);

              EventBus.$emit('alert', {
                type: 'danger',
                message: `An unexpected error occurred.`
              });
            });
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
      } else {
        this.musicKit.setQueue({
          items: [ this.trackToMediaItem(item) ]
        }).then(queue => {
          this.musicKit.play().catch(err => {
            Raven.captureException(err);

            EventBus.$emit('alert', {
              type: 'danger',
              message: `The song could not be played.`
            });
          });
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `The song could not be played.`
          });
        });
      }
    },
    addToLibrary: function (item) {
      this.musicKit.api.addToLibrary({
        songs: [ item.item.id ]
      }).then(() => {
        EventBus.$emit('alert', {
          type: 'success',
          message: `Successfully added "${item.item.attributes.name}" to your library.`
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An error occurred while adding "${item.item.attributes.name}" to your library.`
        });
      });
    },
    queueNext (item) {
      let mediaItem = this.trackToMediaItem(item.item);
      this.musicKit.player.queue.prepend({ items: [mediaItem] });
    },
    queueLater (item) {
      let mediaItem = this.trackToMediaItem(item.item);
      this.musicKit.player.queue.append({ items: [mediaItem] });
    }
  },
  created: function () {
    this.fields = [
      { key: 'attributes.artwork',
        label: '',
        tdClass: 'song-cell',
        formatter: (value, key, item) => {
          return {
            playing: this.nowPlayingItem
              ? item.id === this.nowPlayingItem.id || item.id === this.nowPlayingItem.container.id || item.id === this.nowPlayingItem.sourceId
              : false,
            artwork: value
          };
        } },
      { key: 'attributes.trackNumber', label: '', tdClass: 'song-cell' },
      { key: 'name', label: 'Title' + (this.showArtist ? '<br>Artist' : ''), tdClass: 'song-cell' },
      { key: 'attributes.albumName', label: 'Album', tdClass: 'song-cell' },
      { key: 'attributes.durationInMillis', label: 'Time', tdClass: 'song-cell', formatter: (value, key, item) => this.formatDuration(value) },
      { key: 'actions', label: '', tdClass: 'actions-cell' }
    ];

    if (this.isAlbum) {
      // Don't show album art and name for album entities.
      this.fields.splice(0, 1);
      this.fields.splice(2, 1);
    } else {
      // Don't show track number for non-album entities.
      this.fields.splice(1, 1);
    }

    this.mediaItemDidChange = (event) => {
      this.nowPlayingItem = event.item;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);

    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  },
  destroyed: function () {
    this.musicKit.removeEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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

.actions-cell {
  width: 25px;
}
</style>
