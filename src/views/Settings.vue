
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <p class="text-muted">Settings are stored in your local browser and will not persist across browsers and/or devices.</p>

    <b-form-group label="Theme">
      <b-form-select v-model="theme" :options="themes" />
    </b-form-group>

    <b-form-group label="Playback">
      <b-form-checkbox v-model="showPlaybackNotifications">Show notifications when the song changes</b-form-checkbox>
      <b-form-checkbox v-model="queueAllSongs">Queue all songs in the current view when double clicking on a song</b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'Settings',
  props: {
    title: String
  },
  watch: {
    theme () {
      this.$localStorage.set('theme', this.theme);
      EventBus.$emit('theme');
    },
    showPlaybackNotifications () {
      this.$localStorage.set('showPlaybackNotifications', this.showPlaybackNotifications);
    },
    queueAllSongs () {
      this.$localStorage.set('queueAllSongs', this.queueAllSongs);
    }
  },
  data () {
    return {
      theme: this.$localStorage.get('theme'),
      showPlaybackNotifications: this.$localStorage.get('showPlaybackNotifications'),
      queueAllSongs: this.$localStorage.get('queueAllSongs'),
      themes: {
        'light': 'Light',
        'dark': 'Dark'
      }
    };
  }
};
</script>
