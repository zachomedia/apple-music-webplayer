<template>
  <div class="behaviour-controls">
    <b-button-group>
      <b-button
        variant="link"
        :class="{ 'is-active': shuffleMode !== shuffleModes.off }"
        v-on:click="toggleShuffleMode()">
        <i class="fa fa-random" />
        <span class="sr-only">Shuffle</span>
      </b-button>
      <b-button
        variant="link"
        :class="{ 'is-active': repeatMode !== repeatModes.off }"
        v-on:click="toggleRepeatMode()">
        <i class="fa fa-retweet" />
        <b-badge v-if="repeatMode === repeatModes.one" variant="danger" class="one">1</b-badge>
        <b-badge v-else class="hide">1</b-badge>
        <span class="sr-only">Repeat</span>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'BehaviourControls',
  data () {
    return {
      shuffleModes: {
        off: 0,
        songs: 1
      },
      repeatModes: {
        off: 0,
        one: 1,
        all: 2
      }
    };
  },
  computed: {
    ...mapState('musicKit', [ 'shuffleMode', 'repeatMode' ])
  },
  methods: {
    ...mapActions('musicKit', [ 'toggleShuffleMode', 'toggleRepeatMode' ])
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

.behaviour-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
}

button {
  color: #999;
  font-size: 1.1em;
}

button:not(.is-active):hover {
  color: #aaa;
}

.is-active {
  color: $link-color;
}

.one, .hide {
  font-size: 0.5rem !important;
  float: right;
  right: 5px;
}

.hide {
  opacity: 0;
}
</style>
