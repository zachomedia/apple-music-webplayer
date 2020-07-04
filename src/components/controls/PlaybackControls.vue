<template>
  <div class="playback-controls">
    <b-button-group>
      <b-button variant="link" v-on:click="prev()" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-backward"><span class="sr-only">Previous song</span></i>
      </b-button>
      <b-button variant="link" class="main" v-if="[states.loading, states.waiting, states.seeking].indexOf(playbackState) !== -1" disabled>
        <i class="fa fa-circle-o-notch fa-spin"><span class="sr-only">Loading</span></i>
      </b-button>
      <b-button variant="link" class="main" v-on:click="play()" v-else-if="[states.paused, states.stopped, states.none].indexOf(playbackState) !== -1" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-play"><span class="sr-only">Play</span></i>
      </b-button>
      <b-button variant="link" class="main" v-on:click="pause()" v-else>
        <i class="fa fa-pause"><span class="sr-only">Pause</span></i>
      </b-button>
      <b-button variant="link" v-on:click="next()" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-forward"><span class="sr-only">Next song</span></i>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { errorMessage } from '../../utils';
import Raven from 'raven-js';

export default {
  name: 'PlaybackControls',
  data () {
    return {
      states: MusicKit.PlaybackStates
    };
  },
  computed: {
    ...mapState('musicKit', [ 'playbackState' ])
  },
  methods: {
    async play () {
      try {
        await this.$store.dispatch('musicKit/play');
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async pause () {
      try {
        await this.$store.dispatch('musicKit/pause');
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async prev () {
      try {
        await this.$store.dispatch('musicKit/previous');
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async next () {
      try {
        await this.$store.dispatch('musicKit/next');
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
.playback-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}

.main {
  width: 2.5rem;
}
</style>
