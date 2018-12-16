<template>
  <div class="playback-controls">
    <b-button-group>
      <b-button variant="link" v-on:click="prev()" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-backward" />
      </b-button>
      <b-button variant="link" class="main" v-if="[states.loading, states.waiting, states.seeking].indexOf(playbackState) !== -1" disabled>
        <i class="fa fa-circle-o-notch fa-spin" />
      </b-button>
      <b-button variant="link" class="main" v-on:click="play()" v-else-if="[states.paused, states.stopped, states.none].indexOf(playbackState) !== -1" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-play" />
      </b-button>
      <b-button variant="link" class="main" v-on:click="pause()" v-else>
        <i class="fa fa-pause" />
      </b-button>
      <b-button variant="link" v-on:click="next()" :disabled="[states.none].indexOf(playbackState) !== -1">
        <i class="fa fa-forward" />
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PlaybackControls',
  data () {
    return {
      states: window.MusicKit.PlaybackStates
    };
  },
  computed: {
    ...mapState({
      playbackState: state => state.musicKit.playbackState
    })
  },
  methods: {
    play () {
      const instance = window.MusicKit.getInstance();
      instance.player.play();
    },
    pause () {
      const instance = window.MusicKit.getInstance();
      instance.player.pause();
    },
    prev () {
      const instance = window.MusicKit.getInstance();
      instance.player.skipToPreviousItem();
    },
    next () {
      const instance = window.MusicKit.getInstance();
      instance.player.skipToNextItem();
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
</style>
