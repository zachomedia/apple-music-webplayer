<template>
  <div class="settings">
    <h1 class="h4">Settings</h1>
    <p>Settings are stored in your local browser and will not persist across browsers and/or devices.</p>

    <b-card header="Playback">
      <label>
        Bitrate
        <b-form-radio-group v-model="localBitrate" :options="bitrateOptions" />
      </label>
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
      bitrateOptions: {
        [window.MusicKit.PlaybackBitrate.HIGH]: 'High (256 kbps)',
        [window.MusicKit.PlaybackBitrate.STANDARD]: 'Standard (64 kbps)'
      }
    }
  },
  computed: {
    ...mapState('musicKit', ['bitrate'])
  },
  watch: {
    bitrate () {
      this.localBitrate = this.bitrate;
    },
    localBitrate () {
      this.setBitrate(parseInt(this.localBitrate, 10));
    }
  },
  methods: {
    ...mapActions('musicKit', ['setBitrate'])
  },
  created () {
    this.localBitrate = this.bitrate;
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
