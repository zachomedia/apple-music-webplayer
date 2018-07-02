<template>
  <div class="header container-fluid">
    <div align-self="center" class="logo pull-left pl-2">
      <router-link :to="{ name: 'index' }"><img src="../assets/icon.svg" alt="Zachary Seguin" /></router-link>
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

<style scoped lang="scss">
.header {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  height: 80px;
  font-size: 0.9em;
  overflow: hidden;
  padding: 8px 5px;
  background: #f8f8f8;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);
}
.dark .header {
  background: #333;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);
}

.controls {
  position: absolute;
  left: 80px;
  right: 0;
}

.dark .logo img {
  box-shadow: 0px 0px 1px rgba(100, 100, 100, .5);
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
