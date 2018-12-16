<template>
  <div class="behaviour-controls">
    <b-button-group>
      <b-button
        variant="link"
        :class="{ 'is-active': shuffleMode === shuffleModes.songs }"
        v-on:click="toggleShuffleMode()">
        <i class="fa fa-random" />
        <span class="sr-only">Shuffle</span>
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
      }
    };
  },
  computed: {
    ...mapState({
      shuffleMode: state => state.musicKit.shuffleMode
    })
  },
  methods: {
    ...mapActions('musicKit', [ 'toggleShuffleMode' ])
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

.is-active {
  color: $link-color;
}
</style>
