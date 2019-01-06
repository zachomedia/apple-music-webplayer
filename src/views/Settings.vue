<template>
  <div class="settings">
    <h1 class="h4">Settings</h1>
    <p>Settings are stored in your local browser and will not persist across browsers and/or devices.</p>

    <b-card header="Playback">
      <b-form-group label="Bitrate" class="ml-3">
        <b-form-radio-group v-model="localBitrate" :options="bitrateOptions" />
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
    bitrate () {
      this.localBitrate = this.bitrate;
    },
    localBitrate () {
      this.setBitrate(parseInt(this.localBitrate, 10));
    },
    showPlaybackNotifications () {
      this.localShowPlaybackNotifications = this.showPlaybackNotifications;
    },
    localShowPlaybackNotifications () {
      this.setShowPlaybackNotifications(this.localShowPlaybackNotifications);
    },
    queueAllSongs () {
      this.localQueueAllSongs = this.queueAllSongs;
    },
    localQueueAllSongs () {
      this.setQueueAllSongs(this.localQueueAllSongs);
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
</style>
