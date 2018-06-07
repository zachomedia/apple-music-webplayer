

<template>
  <div class="splash">
    <p class="mb-4"><a href="https://zacharyseguin.ca"><img src="../assets/logo.svg" width="100%" alt="Zachary Seguin" /></a><span>music</span></p>
    
    <h2 class="h5">Hello!</h2>
    <p>This is a web player for <a href="https://applemusic.com">Apple Music</a>.</p>
    <p>The web player is currently under development. 
      At this time, you can listen to songs, albums and playlists in your library.
      <br>
      The player current has some issues on small screen sizes.
    </p>

    <div class="border p-2 mb-4 border-warning rounded bg-warning">
      <h2 class="h5 text-uppercase">Notice</h2>
      <p class="mb-0">This system is built on an API that is currently in beta. The application may stop working at any time.</p>
    </div>

    <p>If you encounter any issues, have any feedback or feature requests, please email <a href="mailto:contact@zacharyseguin.ca">contact@zacharyseguin.ca</a>.</p>

    <p class="mt-5 text-center">
      <b-button variant="primary" v-on:click.prevent="authorize()">Sign in to Apple Music</b-button>
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
  width: 400px;
  margin: 100px auto;
}
</style>
