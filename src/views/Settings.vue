<template>
  <div class="settings">
    <h1 class="h4">Settings</h1>
    <p>Settings are stored in your local browser and will not persist across browsers and/or devices.</p>

    <b-card header="Playback">
      <b-form-group label="Bitrate" class="ml-3">
        <div role="radiogroup">
          <div class="custom-control custom-control-inline custom-radio" v-for="(opt, id) in bitrateOptions" :key="id">
            <label>
              <input type="radio" :value="id" v-model="localBitrate" />
                {{ opt }}
            </label>
          </div>
        </div>
      </b-form-group>

      <b-form-checkbox v-model="localShowPlaybackNotifications">Show playback notifications</b-form-checkbox>
      <br />
      <b-form-checkbox v-model="localQueueAllSongs">Queue all songs when selecting a song</b-form-checkbox>
    </b-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Settings',
  data () {
    return {
      localBitrate: this.bitrate,
      localShowPlaybackNotifications: this.showPlaybackNotifications,
      localQueueAllSongs: this.queueAllSongs,
      bitrateOptions: {
        [MusicKit.PlaybackBitrate.HIGH]: 'High (256 kbps)',
        [MusicKit.PlaybackBitrate.STANDARD]: 'Standard (64 kbps)'
      }
    };
  },
  computed: {
    ...mapState('musicKit', ['bitrate']),
    ...mapState('preferences', ['showPlaybackNotifications', 'queueAllSongs'])
  },
  watch: {
    bitrate (value) {
      this.localBitrate = value;
    },
    localBitrate (value) {
      this.setBitrate(parseInt(value, 10));
    },
    showPlaybackNotifications (value) {
      this.localShowPlaybackNotifications = value;
    },
    localShowPlaybackNotifications (value) {
      this.setShowPlaybackNotifications(value);
    },
    queueAllSongs (value) {
      this.localQueueAllSongs = value;
    },
    localQueueAllSongs (value) {
      this.setQueueAllSongs(value);
    }
  },
  methods: {
    ...mapActions('musicKit', ['setBitrate']),
    ...mapActions('preferences', ['setShowPlaybackNotifications', 'setQueueAllSongs'])
  },
  created () {
    this.localBitrate = this.bitrate;
    this.localShowPlaybackNotifications = this.showPlaybackNotifications;
    this.localQueueAllSongs = this.queueAllSongs;
  }
};
</script>

<style scoped>
.settings {
  margin: 20px auto !important;
  padding: 0 20px !important;
  max-width: 800px;
}

.custom-radio {
  padding-left: 0;
}
</style>
