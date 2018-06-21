<template>
  <div id="app">
    <div v-if="musicKit">
      <!-- Show login / setup screen if we are not authorized -->
      <Login v-if="!musicKit.isAuthorized" />

      <!-- If we are authorized, show the player -->
      <Player :musicKit="musicKit" v-else />
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script>
import Login from './components/Login.vue';
import Player from './components/Player.vue';

import EventBus from './event-bus';
import privateConfig from './private';

export default {
  name: 'app',
  data: () => {
    return {
      musicKit: null,
    };
  },
  components: {
    Login,
    Player
  },
  methods: {
  },
  created: function() {
    if ("Notification" in window) {
      window.Notification.requestPermission();
    }

    let initialize = () => {
      // Configure MusicKit
      window.MusicKit.configure({
        developerToken: privateConfig.developerToken,
        app: {
          name: 'Zachary Seguin Music',
          build: '0.0.1'
        }
      });

      this.musicKit = window.MusicKit.getInstance();

      // Register events
      this.onAuthorize = () => {
        this.musicKit.authorize();
      }
      EventBus.$on('authorize', this.onAuthorize);

      this.onUnauthorize = () => {
        this.musicKit.unauthorize();
      }
      EventBus.$on('unauthorize', this.onUnauthorize);
    }

    // Check for MusicKit
    if (window.MusicKit) {
      initialize();
    } else {
      document.addEventListener('musickitloaded', () => {
        initialize();
      });
    }
  },
  destroyed: function() {
    EventBus.$off('authorize', this.onAuthorize);
    EventBus.$off('unauthorize', this.onUnauthorize);
  }
}
</script>

<style>
body {
  background: #eee !important;
};

#app {
  background: #eee;
  font-size: 0.9rem;

  height: 100%;
}

/*
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
*/
</style>
