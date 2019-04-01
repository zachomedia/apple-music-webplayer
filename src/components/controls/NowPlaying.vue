<template>
  <div class="now-playing">
    <div class="info">
      <img v-if="nowPlayingItem && nowPlayingItem.attributes.artwork"
          class="artwork"
          :src="nowPlayingItem.attributes.artwork | formatArtworkURL(60)" />
      <img v-else
          class="artwork"
          src="../../assets/icon.svg" />

      <div class="track-info" v-if="nowPlayingItem">
        <div class="columns">
          <p class="column name h5 mb-1">{{ nowPlayingItem.attributes.name }}</p>
          <content-rating :rating="nowPlayingItem.attributes.contentRating" class="content-rating" />
          <song-actions class="column" :song="nowPlayingItem" />
        </div>
        <p class="artist text-muted">{{ nowPlayingItem.attributes.artistName }} &mdash; {{ nowPlayingItem.attributes.albumName }}</p>
      </div>
      <div class="track-info" v-else>
        <p class="name h5 mb-1">Hello!</p>
        <p class="artist text-muted">Select any item to play.</p>
      </div>

      <div class="time" v-if="playbackTime">
        <p class="text-muted">{{ playbackTime.currentPlaybackTime | formatSeconds }} / {{ playbackTime.currentPlaybackDuration | formatSeconds }}</p>
      </div>

      <div class="queue">
        <b-button variant="link" @click="showQueue = !showQueue"><i class="fa fa-list-ul" /></b-button>
        <b-modal v-model="showQueue" title="Queue" centered hide-footer>
          <b-form-radio-group v-model="queueTab"
                              buttons button-variant="outline-primary"
                              class="mb-1 btn-group-sm split w-100">
            <b-form-radio :value="0" class="w-50">Up Next</b-form-radio>
            <b-form-radio :value="1" class="w-50">History</b-form-radio>
          </b-form-radio-group>

          <div v-if="queueTab === 0">
            <songs v-if="upNext.length > 0" :index-add="queue.length - upNext.length" :songs="upNext" is-queue combine />
            <p v-else class="text-center text-muted pt-4">Your queue is empty.</p>
          </div>
          <div v-if="queueTab === 1">
            <songs v-if="history.length > 0" :songs="history" :queueAll="false" combine />
            <p v-else class="text-center text-muted pt-4">Your history is empty.</p>
          </div>
        </b-modal>
      </div>
    </div>

    <div ref="progressTooltip" class="progressTooltip">{{ hoverTooltipTime | formatSeconds }}</div>
    <b-progress ref="songProgress"
      variant="success"
      class="songProgress br-0"
      height="6px"
      v-if="playbackTime"
      @click.native="seekToTime($event)"
      @mousemove.native="getHoverTime($event)"
      @mouseover.native="showTooltip()"
      @mouseleave.native="hideTooltip()">
      <b-progress-bar variant="danger" :value="playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100" />
      <b-progress-bar variant="dark" :value="bufferedProgress - playbackTime.currentPlaybackTime / playbackTime.currentPlaybackDuration * 100" />
    </b-progress>
    <b-progress v-else height="6px" class="br-0" :value="0" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Raven from 'raven-js';
import { formatSeconds, formatArtworkURL, errorMessage } from '../../utils';

import ContentRating from '../utils/ContentRating';
import SongActions from './SongActions';
import Songs from '../collections/Songs';

export default {
  name: 'NowPlaying',
  components: {
    ContentRating,
    SongActions,
    Songs
  },
  filters: {
    formatSeconds,
    formatArtworkURL
  },
  data () {
    return {
      queueTab: 0,
      showQueue: false,
      hoverTooltipTime: '0:00'
    };
  },
  computed: {
    ...mapState('musicKit', ['nowPlayingItem', 'playbackTime', 'bufferedProgress', 'queue', 'queuePosition', 'history']),
    upNext () {
      return this.queue.filter((_, indx) => indx > this.queuePosition);
    }
  },
  methods: {
    showTooltip () {
      this.$refs.progressTooltip.style.opacity = 1;
    },
    hideTooltip () {
      this.$refs.progressTooltip.style.opacity = 0;

      setTimeout(() => {
        if (this.$refs.progressTooltip && this.$refs.progressTooltip.style.opacity === '0') {
          this.$refs.progressTooltip.style.left = '2px';
          this.$refs.progressTooltip.style.right = 'auto';
        }
      }, 1000);
    },
    getHoverTime (event) {
      var hoverLeftOffset = (event.pageX - this.$refs.songProgress.$el.offsetParent.offsetLeft);
      var percentage = Math.max(0, Math.min(1, (hoverLeftOffset / this.$refs.songProgress.$el.offsetWidth)));
      this.hoverTooltipTime = this.playbackTime.currentPlaybackDuration * percentage;
      var newLeft = event.pageX - this.$refs.songProgress.$el.offsetParent.offsetLeft - (this.$refs.progressTooltip.offsetWidth / 2);
      // do not allow the tooltip to go off the screen, maximum of 10px past progress bar
      if (newLeft > (this.$refs.songProgress.$el.offsetWidth - this.$refs.progressTooltip.offsetWidth)) {
        this.$refs.progressTooltip.style.left = 'auto';
        this.$refs.progressTooltip.style.right = '2px';
      } else {
        this.$refs.progressTooltip.style.left = Math.max(2, newLeft) + 'px';
        this.$refs.progressTooltip.style.right = 'auto';
      }
    },
    async seekToTime (event) {
      var clickLeftOffset = (event.pageX - event.target.offsetParent.offsetLeft);
      var fullWidth = this.$refs.songProgress.$el.offsetWidth;
      var percentage = (clickLeftOffset / fullWidth);

      try {
        await this.$store.dispatch('musicKit/seek', this.playbackTime.currentPlaybackDuration * percentage);
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    }
  }
};
</script>

<style lang="scss" scoped>
p {
  margin: 0;
  padding: 0;
}

.now-playing {
  position: relative;
  font-size: 0.8rem;
}

.info {
  display: flex;
  align-items: center;
}

.artwork {
  width: 60px;
  height: 60px;
  margin-right: 20px;
}

.track-info {
  display: flex;
  flex-direction: column;
  flex: 2;
  min-width: 0;

  p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.content-rating {
  margin-top: 2px;
}

.time {
  flex: 0;
  min-width: 80px;
  margin-right: 20px;
  text-align: right;
}

.songProgress {
  cursor: pointer;
}
.progressTooltip {
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

.columns {
  display: flex;
}

.progress-bar.bg-dark {
  background: #303030 !important;
}
</style>
