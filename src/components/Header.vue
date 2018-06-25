<template>
  <div class="header container-fluid">
    <div align-self="center" class="logo pull-left pl-2">
      <a href="https://zacharyseguin.ca"><img src="../assets/icon.svg" alt="Zachary Seguin" /></a>
    </div>
    <!-- Controls -->
    <div class="controls">
      <b-row>
        <slot name="controls">
          <b-col align-self="center" cols="3" sm="2">
            <MediaControls />
          </b-col> 
          <b-col align-self="center" class="mr-2">
            <NowPlaying />
          </b-col>
        </slot>
      </b-row>
    </div>
  </div>
</template>

<script>
  // Import custom controls
  import MediaControls from '../components/MediaControls.vue';
  import NowPlaying from '../components/NowPlaying.vue';

  export default {
    name: 'Header',
    components: {
      MediaControls,
      NowPlaying
    }
  };
</script>

<style scoped>
.header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: #f8f8f8;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);
  padding: 8px 5px;
  overflow: hidden;
  height: 80px;
  font-size: 0.9em;
}

.controls {
  position: absolute;
  left: 60px;
  right: 0;
}

.logo img {
  height: 100%;
  max-height: 50px;
  margin-top: 6px;
}

@media (max-width: 680px) {
  .logo { 
    display: none;
  }

  .controls {
    left: 0;
  }
}
</style>
