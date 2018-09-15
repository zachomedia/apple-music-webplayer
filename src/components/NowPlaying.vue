
<template>
  <div class="now-playing">
     <div class="info">
         <img v-if="nowPlayingItem && nowPlayingItem.attributes.artwork"
              :src="nowPlayingItem.attributes.artwork | formatArtworkURL" />
         <div v-else class="placeholder" />

         <div class="main" v-if="nowPlayingItem">
            <span class="title">
              {{ nowPlayingItem.attributes.name }}
              <b-dropdown variant="link" size="sm" no-caret boundary="viewport" v-if="isAuthorized">
                <template slot="button-content">
                  <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
                </template>

                <b-dropdown-item-button @click.stop="addToLibrary(nowPlayingItem)">Add to library</b-dropdown-item-button>
                <b-dropdown-item-button @click.stop="goToAlbum(nowPlayingItem)">Go to album</b-dropdown-item-button>
                <b-dropdown-divider />
                <b-dropdown-item-button @click.stop="rateSong(nowPlayingItem, 1)">Love</b-dropdown-item-button>
                <b-dropdown-item-button @click.stop="rateSong(nowPlayingItem, -1)">Dislike</b-dropdown-item-button>
              </b-dropdown>
            </span>
            <span class="artist text-muted">{{ nowPlayingItem.attributes.artistName }} &mdash; {{ nowPlayingItem.attributes.albumName }}</span>
         </div>
         <div class="main" v-else>
            <span class="title">Hello!</span>
            <span class="artist text-muted">Select a song, album or playlist to play.</span>
         </div>

         <div class="right">
            <span>{{ playbackTime.currentPlaybackTime | formatSeconds }} / {{ playbackTime.currentPlaybackDuration | formatSeconds }}</span>
         </div>

         <div class="queue">
           <b-button variant="link" @click="showQueue = !showQueue"><i class="fa fa-list-ul" /></b-button>
           <b-modal v-model="showQueue" title="Queue" centered hide-footer>
              <b-form-radio-group v-model="queueTab"
                                 buttons button-variant="outline-primary"
                                 class="mb-1 btn-group-sm split w-100">
               <b-form-radio :value="1" class="w-50">Up Next</b-form-radio>
               <b-form-radio :value="2" class="w-50">History</b-form-radio>
              </b-form-radio-group>
              <b-list-group flush v-if="queue.length > 0">
                 <b-list-group-item href="#" v-for="(item, index) in (queueTab === 1 ? queue : queue.slice().reverse())"
                                    v-bind:key="item.id"
                                    @click.prevent="queueTab === 1 ? change(index) : change(queue.length - 1 - index)"
                                    v-if="queueTab == 1 ? index > queuePosition : queue.length - 1 - index < queuePosition">
                     <div class="queue-item">
                        <div class="mr-2">
                           <lazy-img v-if="item.attributes.artwork"
                                 :src="item.attributes.artwork | formatArtworkURL(40)" />
                        </div>
                        <div class="m-0 grow-1">
                           <p class="m-0 pb-1 text-bold">{{ item.attributes.name }}</p>
                           <p class="m-0 text-muted">{{ item.attributes.albumName }}</p>
                        </div>
                        <div class="m-0 text-right text-muted">
                           {{ item.attributes.durationInMillis | formatMillis }}
                        </div>
                     </div>
                 </b-list-group-item>
                 <b-list-group-item v-if="queueTab == 1 && queuePosition == queue.length - 1">
                    <p class="text-center text-muted pt-4">The last song in your queue is currently playing.</p>
                 </b-list-group-item>
                 <b-list-group-item v-if="queueTab == 2 && queuePosition == 0">
                    <p class="text-center text-muted pt-4">The first song in your queue is currently playing.</p>
                 </b-list-group-item>
              </b-list-group>
              <p v-else class="text-center text-muted pt-4">Your queue is empty.</p>
           </b-modal>
        </div>
      </div>

      <div id="progressTooltip">{{ hoverTooltipTime | formatSeconds }}</div>

      <b-progress id="songProgress" height="5px" :value="playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100"
        v-if="playbackTime.currentPlaybackDuration > 0" v-b-tooltip.hover @click.native="seekToTime($event)"
        @mousemove.native="getHoverTime($event)" @mouseover.native="showTooltip()" @mouseleave.native="hideTooltip()"></b-progress>
  </div>
</template>

<script>
import EventBus from '../event-bus';
import Raven from 'raven-js';
import LazyImg from './LazyImg';
import {formatArtworkURL, formatMillis, formatSeconds, rateSong} from '../utils';

export default {
  name: 'NowPlaying',
  components: {LazyImg},
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      isAuthorized: musicKit.isAuthorized,
      nowPlayingItem: musicKit.player.nowPlayingItem,
      queueTab: 1,
      queuePosition: musicKit.player.queue.position,
      queue: musicKit.player.queue.items,
      showQueue: false,
      hoverTooltipTime: '0:00',
      playbackTime: {
        currentPlaybackDuration: musicKit.player.currentPlaybackDuration,
        currentPlaybackTime: musicKit.player.currentPlaybackTime,
        currentPlaybackTimeRemaining: musicKit.player.currentPlaybackTimeRemaining
      }
    };
  },
  filters: {
    formatArtworkURL,
    formatSeconds,
    formatMillis
  },
  methods: {
    addToLibrary: function (item) {
      this.musicKit.api.addToLibrary({
        songs: [ item.id ]
      }).then(() => {
        EventBus.$emit('alert', {
          type: 'success',
          message: `Successfully added "${item.attributes.name}" to your library.`
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An error occurred while adding "${item.attributes.name}" to your library.`
        });
      });
    },
    goToAlbum: function (item) {
      if (item.assets && item.assets[0].metadata) {
        this.$router.push({
          name: 'albums',
          params: {
            id: item.assets[0].metadata.playlistId
          }
        });
      } else {
        EventBus.$emit('alert', {
          type: 'danger',
          message: `Unable to locate album ID for "${item.albumName}".`
        });
      }
    },
    rateSong,
    seekToTime: function (event) {
      var clickLeftOffset = (event.pageX - event.target.offsetParent.offsetLeft);
      var fullWidth = document.getElementById('songProgress').offsetWidth;
      var percentage = (clickLeftOffset / fullWidth);
      this.musicKit.player.seekToTime(this.playbackTime.currentPlaybackDuration * percentage);
    },
    showTooltip: function () {
      document.getElementById('progressTooltip').style.opacity = 1;
    },
    hideTooltip: function () {
      document.getElementById('progressTooltip').style.opacity = 0;
    },
    getHoverTime: function (event) {
      var progressBar = document.getElementById('songProgress');
      var tooltip = document.getElementById('progressTooltip');
      var hoverLeftOffset = (event.pageX - progressBar.offsetParent.offsetLeft);
      var percentage = (hoverLeftOffset / progressBar.offsetWidth);
      this.hoverTooltipTime = this.playbackTime.currentPlaybackDuration * percentage;
      var newLeft = event.pageX - progressBar.offsetParent.offsetLeft - (tooltip.offsetWidth / 2);
      tooltip.style.left = newLeft + 'px';
    },
    change (index) {
      this.musicKit.changeToMediaAtIndex(index).catch(err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An unexpected error occurred.`
        });
      });
    }
  },
  created: function () {
    // Create callback functions
    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);

    this.mediaItemDidChange = (event) => {
      this.nowPlayingItem = event.item;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);

    this.queueItemsDidChange = (items) => {
      this.queue = items;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.queueItemsDidChange, this.queueItemsDidChange);

    this.queuePositionDidChange = (event) => {
      this.queuePosition = event.position;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.queuePositionDidChange, this.queuePositionDidChange);

    this.playbackTimeDidChange = (event) => {
      this.playbackTime = event;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
  },
  destroyed: function () {
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.authorizationStatusDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.queueItemsDidChange, this.queueItemsDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.queuePositionDidChange, this.queuePositionDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
    this.musicKit.removeEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.now-playing {
  border: 1px solid #e3e3e3;
  background: white;
  padding: 0px;
  border-radius: 4px;
  position: relative;
}
.dark .now-playing {
  border-color: #444;
  background: #222;
}

.now-playing .info {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
}

.now-playing img {
  width: 60px;
  height: 60px;
  margin-right: 10px;
}

.now-playing .main {
  flex-grow: 2;
}

.now-playing .right {
  text-align: right;
  padding: 0 10px;
  color: #888;
}

.dark .now-playing .right {
  color: #aaa;
}

.now-playing .title {
  font-weight: bold;
}

.title {
  display: block;
  font-size: 1.2em;
}

.artist {
  display: block;
}

.placeholder {
  display: block;
  width: 60px;
  height: 60px;
  margin-right: 10px;
  background: #f2f2f2;
}

.dark .placeholder {
  background: #111;
}

#songProgress {
  cursor: pointer;
}

#progressTooltip {
  position: absolute;
  bottom: 8px;
  padding: 5px 7px;
  min-width: 45px;
  text-align: center;
  color: #fff;
  border-radius: 2px;
  background: rgba(98, 107, 115, 0.9);
  opacity: 0;
  -webkit-transition: opacity 0.2s;
  transition: opacity 0.2s;
}

.dark #progressTooltip {
  background: rgba(65, 100, 137, 0.9);
}

@media (max-width: 650px) and (min-width: 601px) {
  img, .placeholder {
    width: 0;
  }
}

@media (max-width: 600px) {
  .main {
    display: none;
  }
}

.queue-item {
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    box-sizing: content-box;
    border: 2px solid transparent;
  }

  .grow-1 {
    flex-grow: 1;
  }
}
</style>
