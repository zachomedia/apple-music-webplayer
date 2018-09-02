
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    <p class="text-muted">{{ songs.length }} {{ songs.length | pluralize('song') }}, {{ duration | humanize }}</p>

    <b-table :items="songs" :fields="fields" hover v-on:row-clicked="clicked">
      <template slot="attributes.artwork" slot-scope="data">
        <lazy-img v-if="data.item.attributes && data.item.attributes.artwork"
             :src="data.value.artwork | formatArtworkURL(40)" />
        <div class="playing-indicator" v-if="isPlaying(data.item)">
          <i class="fa fa-volume-up"></i>
        </div>
      </template>

      <template slot="attributes.trackNumber" slot-scope="data">
        <div v-if="!isPlaying(data.item)">
          {{ data.item.attributes.trackNumber }}
        </div>
        <div v-else>
          <div class="album-playing-indicator">
            <i class="fa fa-volume-up"></i>
          </div>
        </div>
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
import LazyImg from './LazyImg';
import {formatArtworkURL, formatMillis, humanize} from '../utils';

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
    formatArtworkURL,
    humanize
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
        }).then(() => {
          this.musicKit.play().catch(err => console.error(err));
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
    },
    isPlaying (item) {
      if (!this.nowPlayingItem) {
        return false;
      }
      return item.id === this.nowPlayingItem.id ||
        item.id === this.nowPlayingItem.container.id ||
        item.id === this.nowPlayingItem.sourceId;
    }
  },
  created: function () {
    this.fields = [
      { key: 'attributes.artwork', label: '', tdClass: 'song-cell' },
      { key: 'attributes.trackNumber', label: '', tdClass: 'song-cell' },
      { key: 'name', label: 'Title' + (this.showArtist ? '<br>Artist' : ''), tdClass: 'song-cell' },
      { key: 'attributes.albumName', label: 'Album', tdClass: 'song-cell' },
      { key: 'attributes.durationInMillis', label: 'Time', tdClass: 'song-cell', formatter: value => formatMillis(value) },
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
<style scoped lang="scss">
  $art-radius: 4px;
  $art-size: 40px;

img {
  width: $art-size;
  height: $art-size;
  border-radius: $art-radius;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

.playing-indicator {
  background-color: rgba(0, 0, 0, .3);
  border-radius: $art-radius;
  color: #fff;
  font-size: 24px;
  height: $art-size;
  line-height: 40px;
  margin-top: -40px;
  position: absolute;
  text-align: center;
  width: $art-size;
}

.album-playing-indicator {
  color: #007bff;
  font-size: 20px;
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

.song-cell:first-child {
  width: 60px;
}
</style>
