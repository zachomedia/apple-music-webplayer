<template>
  <div class="player" @keyup.esc="hideFullScreenPlayer" @mousemove="mouseMoved" tabindex="0">
    <div class="close" v-show="showControls">
      <b-btn variant="link" class="float-right" @click.prevent="hideFullScreenPlayer"><i class="fa fa-close"><span class="sr-only">Close</span></i></b-btn>
    </div>

    <div class="player-content">
      <div class="media">
        <img v-if="nowPlayingItem && nowPlayingItem.attributes.artwork"
            class="artwork d-none d-sm-block"
            :src="nowPlayingItem.attributes.artwork | formatArtworkURL(60)" />
        <img v-else
            class="artwork placeholder d-none d-sm-block"
            src="../../assets/icon.svg" />

        <div class="time mt-3" v-if="playbackTime">
          <p class="text-muted">{{ playbackTime.currentPlaybackTime | formatSeconds }} / {{ playbackTime.currentPlaybackDuration | formatSeconds }}</p>
        </div>

        <playback-progress class="track-progress position-relative w-100 mb-3" />

        <div class="track-info" v-if="nowPlayingItem">
          <div class="columns">
            <p class="column name h5 mb-1">{{ nowPlayingItem.attributes.name }}</p>
            <content-rating :rating="nowPlayingItem.attributes.contentRating" class="content-rating" />
            <song-actions class="column" :song="nowPlayingItem" v-if="showControls" />
          </div>
          <p class="artist text-muted">{{ nowPlayingItem.attributes.artistName }} &mdash; {{ nowPlayingItem.attributes.albumName }}</p>
        </div>
        <div class="track-info" v-else>
          <p class="name h5 mb-1">Hello!</p>
          <p class="artist text-muted">Select any item to play.</p>
        </div>
      </div>

      <div class="controls primary-controls" v-if="showControls">
        <playback-controls class="playback" />
      </div>

      <div class="controls secondary-controls d-none d-sm-flex" v-if="showControls">
        <behaviour-controls class="behaviour" />
        <volume-control class="volume" />
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

.close {
  position: absolute;
  top: 10px;
  right: 10px;

  .btn {
    color: white;
  }
}

.player {
  background: $body-bg;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
}

.player-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;

  height: 100%;
  max-height: 90%;
  max-width: 50%;
  width: 70%;
  margin: 0 auto;

  .media {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 2;

    .artwork:not(.placeholder) {
      max-height: 80%;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, .4);
      flex-grow: 1;
      border-radius: 4px;
    }

    .artwork.placeholder {
      max-height: 60%;
      width: 40%;
    }

    .track-progress {
      position: relative;
      height: 10px;
    }
  }

  .controls {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 60%;
    margin: 0 auto;
    flex-grow: 0;

    > div {
      flex-grow: 0;
    }

    .playback {
      margin: 10px 0;

      /deep/ .btn {
        font-size: 1.4em;
      }
    }
  }
}

.columns {
  display: flex;
  justify-content: center;
}
</style>
