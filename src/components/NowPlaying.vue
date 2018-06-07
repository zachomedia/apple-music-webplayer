

<template>
  <div class="now-playing">
     <div class="info">
         <img v-if="mediaItem && mediaItem.attributes.artwork" :src="formatArtworkURL(mediaItem.attributes.artwork)" />
         <div v-else class="placeholder" />

         <div class="main" v-if="mediaItem">
            <span class="title">{{ mediaItem.attributes.name }}</span>
            <span class="artist">{{ mediaItem.attributes.artistName }} &mdash; {{ mediaItem.attributes.albumName }}</span>
         </div>
         <div class="main" v-else>
            <span class="title">Hello!</span>
            <span class="artist">Select a song, album or playlist to play.</span>
         </div>

         <div class="right">
            <span>{{ playbackTime.currentPlaybackTime | formattedDuration('seconds') }} / {{ playbackTime.currentPlaybackDuration | formattedDuration('seconds') }}</span>
         </div>
      </div>

      <b-progress height="2px" :value="playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100"  v-if="playbackTime.currentPlaybackDuration > 0"></b-progress>
  </div>
</template>

<script>
import EventBus from "../event-bus";
import moment from "moment";

export default {
  name: "NowPlaying",
  data: function() {
     let musicKit = window.MusicKit.getInstance();

      return {
         musicKit: musicKit,
         mediaItem: musicKit.player.nowPlayingItem,
         playbackTime: {
            currentPlaybackDuration: musicKit.player.currentPlaybackDuration,
            currentPlaybackTime: musicKit.player.currentPlaybackTime,
            currentPlaybackTimeRemaining: musicKit.player.currentPlaybackTimeRemaining
         }
      };
  },
  filters: {
      formattedDuration: function(value, unit) {
         let pad = function(num) {
            if (num < 10) {
               num = "0" + num;
            }

            return num;
         };

         let m = moment.duration(value, unit);

         return m.minutes() + ":" + pad(m.seconds());
      }
  },
  methods: {
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
      formatArtworkURL: function(url, height, width) {
         return MusicKit.formatArtworkURL(url, width, width);
      }
  },
   created: function() {
      // Create callback functions
      this.mediaItemDidChange = (event) => {
         this.mediaItem = event.item;

         // Show a notification
         if (('Notification' in window) && event.item) {
            var notification = new window.Notification(event.item.attributes.name, {
               tag: 'currentMediaItem',
               body: event.item.attributes.artistName + " (" + this.formatDuration(event.item.attributes.durationInMillis) + ")",
               icon: event.item.attributes.artwork ? window.MusicKit.formatArtworkURL(event.item.attributes.artwork) : null
            });

            setTimeout(notification.close.bind(this), event.item.attributes.durationInMillis);
         }
      }
      this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);

      this.playbackTimeDidChange = (event) => {
         this.playbackTime = event;
      }
      this.musicKit.addEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
   },
   destroyed: function() {
      this.musicKit.removeEventListener(window.MusicKit.Events.playbackTimeDidChange, this.playbackTimeDidChange);
      this.musicKit.removeEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
   }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.now-playing {
  border: 1px solid #e3e3e3;
  background: white;
  padding: 0px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.now-playing .info {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
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

.now-playing .title {
  font-weight: bold;
}

.title {
  display: block;
  color: black;

  font-size: 1.2em;
}

.artist {
  display: block;
  color: #666;
}

.placeholder {
   display: block;
   width: 60px;
   height: 60px;
   margin-right: 10px;
   background: #f2f2f2;
}
</style>
