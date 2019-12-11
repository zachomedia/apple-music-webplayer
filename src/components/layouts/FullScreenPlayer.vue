<template>
  <div class="player" @keyup.esc="hideFullScreenPlayer" @mousemove="mouseMoved" tabindex="0">
    <div class="close" v-show="showControls">
      <b-btn variant="link" class="float-right" @click.prevent="hideFullScreenPlayer"><i class="fa fa-close"><span class="sr-only">Close</span></i></b-btn>
    </div>

    <div class="player-content">
      <div class="artwork-wrapper mb-2">
        <img v-if="nowPlayingItem && nowPlayingItem.attributes.artwork"
            class="artwork"
            :src="nowPlayingItem.attributes.artwork | formatArtworkURL" />
        <img v-else
            class="artwork placeholder"
            src="../../assets/icon.svg" />
      </div>

      <div class="media">
        <div class="time mt-3 mb-2" v-if="playbackTime">
          <p class="text-muted mb-0">{{ (playbackTime.currentPlaybackTime || 0) | formatSeconds }}</p>
          <p class="text-muted mb-0">{{ (playbackTime.currentPlaybackDuration || 0) | formatSeconds }}</p>
        </div>

        <playback-progress class="track-progress position-relative w-100 mb-3" />

        <div class="track-info text-center" v-if="nowPlayingItem">
          <div class="columns">
            <p class="column name h5 mb-1">{{ nowPlayingItem.attributes.name }}</p>
            <content-rating :rating="nowPlayingItem.attributes.contentRating" class="content-rating" />
            <song-actions class="column" :song="nowPlayingItem" v-if="showControls" />
          </div>
          <p class="artist text-muted">{{ nowPlayingItem.attributes.artistName }} &mdash; {{ nowPlayingItem.attributes.albumName }}</p>
        </div>
        <div class="track-info text-center" v-else>
          <p class="name h5 mb-1">Hello!</p>
          <p class="artist text-muted">Select any item to play.</p>
        </div>
      </div>

      <div class="controls primary-controls" v-if="showControls">
        <playback-controls class="playback" />

        <div class="columns">
          <behaviour-controls class="behaviour" />
          <volume-control class="volume" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import components
import VolumeControl from '../controls/VolumeControl';
import PlaybackControls from '../controls/PlaybackControls';
import BehaviourControls from '../controls/BehaviourControls';
import PlaybackProgress from '../controls/PlaybackProgress';

import ContentRating from '../utils/ContentRating';
import SongActions from '../controls/SongActions';

import { mapState, mapActions } from 'vuex';

// Import utils
import { formatSeconds, formatArtworkURL } from '../../utils';
import { clearTimeout } from 'timers';

export default {
  name: 'FullScreenPlayer',
  data () {
    return {
      showControls: false,
      hideControlsTimeout: null
    };
  },
  computed: {
    ...mapState('musicKit', [ 'nowPlayingItem', 'playbackTime' ])
  },
  filters: {
    formatSeconds,
    formatArtworkURL
  },
  methods: {
    ...mapActions('preferences', [ 'hideFullScreenPlayer' ]),
    mouseMoved () {
      if (this.hideControlsTimeout) {
        clearTimeout(this.hideControlsTimeout);
        this.hideControlsTimeout = null;
      }

      this.showControls = true;
      this.hideControlsTimeout = setTimeout(() => {
        this.showControls = false;
        this.hideControlsTimeout = null;
      }, 5000);
    }
  },
  components: {
    ContentRating,
    SongActions,
    VolumeControl,
    PlaybackControls,
    BehaviourControls,
    PlaybackProgress
  },
  mounted () {
    this.$el.focus();
  },
  destroyed () {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
      this.hideControlsTimeout = null;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";
@import "node_modules/bootstrap/scss/functions";
@import "node_modules/bootstrap/scss/variables";
@import "node_modules/bootstrap/scss/mixins/_breakpoints";

.close {
  position: absolute;
  top: 10px;
  right: 10px;

  .btn {
    color: white;
  }
}

.player-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 100%;
  padding: 40px;
}

.artwork-wrapper {
  flex-grow: 1;
  flex-shrink: 1;
  height: 10px;
  width: 100%;
  text-align: center;

  display: flex;
  align-items: center;

  .artwork {
    max-height: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .artwork:not(.placeholder) {
    border-radius: 4px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  }
}

.media {
  .track-info {
    padding: 20px 0;
  }
}

.media, .controls {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;

  width: 100%;
}

.controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.columns {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
