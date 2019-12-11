<template>
  <div class="now-playing">
    <div class="info">
      <img v-if="nowPlayingItem && nowPlayingItem.attributes.artwork"
          class="artwork"
          :src="nowPlayingItem.attributes.artwork | formatArtworkURL(60)" />
      <img v-else
          class="artwork placeholder"
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
        <p class="text-muted">{{ (playbackTime.currentPlaybackTime || 0) | formatSeconds }} / {{ (playbackTime.currentPlaybackDuration || 0) | formatSeconds }}</p>
      </div>

      <div class="queue">
        <b-button variant="link" @click="showQueue = !showQueue"><i class="fa fa-list-ul"><span class="sr-only">Show queue</span></i></b-button>
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
            <songs v-if="history.length > 0" :songs="history" :queueAll="false" is-queue combine />
            <p v-else class="text-center text-muted pt-4">Your history is empty.</p>
          </div>
        </b-modal>
      </div>

      <div class="full-screen">
        <b-btn variant="link" @click.prevent="showFullScreenPlayer"><i class="fa fa-television"><span class="sr-only">Show full screen player</span></i></b-btn>
      </div>
    </div>

    <playback-progress />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { formatSeconds, formatArtworkURL } from '../../utils';

import PlaybackProgress from './PlaybackProgress';

import ContentRating from '../utils/ContentRating';
import SongActions from './SongActions';
import Songs from '../collections/Songs';

export default {
  name: 'NowPlaying',
  components: {
    PlaybackProgress,
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
    ...mapState('musicKit', ['nowPlayingItem', 'playbackTime', 'queue', 'queuePosition', 'history']),
    upNext () {
      return this.queue.filter((_, indx) => indx > this.queuePosition);
    }
  },
  methods: {
    ...mapActions('preferences', [ 'showFullScreenPlayer' ])
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

.artwork.placeholder {
  padding: 5px;
  margin-right: 0;
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
