

<template>
  <div>
    <b-button-group>
      <b-button variant="link" v-on:click="prev()"><i class="fa fa-backward" /></b-button>
      <b-button variant="link" class="main" v-if="state === states.loading || state === states.waiting" disabled><i class="fa fa-circle-o-notch fa-spin" /></b-button>
      <b-button variant="link" class="main" v-on:click="play()" v-else-if="state !== states.playing"><i class="fa fa-play" /></b-button>
      <b-button variant="link" class="main" v-on:click="pause()" v-else><i class="fa fa-pause" /></b-button>
      <b-button variant="link" v-on:click="next()"><i class="fa fa-forward" /></b-button>
    </b-button-group>
  </div>
</template>

<script>
import EventBus from "../event-bus";

export default {
  name: "MediaControls",
  data: function() {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      states: window.MusicKit.PlaybackStates,
      state: musicKit.player.playbackState
    };
  },
  methods: {
    play: function() {
      this.musicKit.player.play();
    },
    pause: function() {
      this.musicKit.player.pause();
    },
    prev: function() {
      this.musicKit.player.skipToPreviousItem();
    },
    next: function() {
      this.musicKit.player.skipToNextItem();
    }
  },
    created: function() {
      this.playbackStateDidChange = (event) => {
        this.state = event.state;
      }
      this.musicKit.addEventListener(window.MusicKit.Events.playbackStateDidChange, this.playbackStateDidChange);
    },
    destroyed: function() {
      this.musicKit.removeEventListener(window.MusicKit.Events.playbackStateDidChange, this.playbackStateDidChange);
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
button {
  color: #333;
  font-size: 1.2em;
}

.main {
  font-size: 1.8em;
}
</style>
