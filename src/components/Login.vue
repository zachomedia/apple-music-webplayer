

<template>
  <div class="splash">
    <p class="mb-4"><a href="https://zacharyseguin.ca"><img src="../assets/logo.svg" width="100%" alt="Zachary Seguin" /></a><span>music</span></p>
    
    <h2 class="h5">Hello!</h2>
    <p>This is a web player for <a href="https://applemusic.com">Apple Music</a>, built using <a href="https://developer.apple.com/documentation/musickitjs">MusicKit JS</a>.</p>
    <p>The web player is currently under <a href="https://github.com/zachomedia/apple-music-webplayer">development</a>.</p>

    <p class="mt-5 mb-5 text-center">
      <b-button variant="primary" v-on:click.prevent="authorize()">Sign in to Apple Music</b-button>
    </p>

    <div class="border p-2 mb-4 border-warning rounded bg-warning">
      <h2 class="h5 text-uppercase">Notice</h2>
      <p class="mb-0">This system is built on an API that is currently in beta. The application may stop working at any time.</p>
    </div>

    <p>If you encounter any issues, have any feedback or feature requests, 
      please <a href="https://github.com/zachomedia/apple-music-webplayer/issues">submit an issue on GitHub</a> 
      or send an email to <a href="mailto:contact@zacharyseguin.ca">contact@zacharyseguin.ca</a>.</p>

    <p class="text-muted">
      Apple and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries
    </p>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'Login',
  methods: {
    authorize: function() {
      EventBus.$emit('authorize');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p span {
  color: #007bff;
  float: right;
  display: block;
  margin-top: -15px;
}

.splash {
  width: 90%;
  max-width: 400px;
  margin: 100px auto;
}
</style>
