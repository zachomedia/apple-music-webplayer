<template>
  <div class="header container-fluid">
    <div align-self="center" class="logo pull-left pl-2">
      <router-link :to="{ name: 'index' }"><img src="../assets/icon.svg" alt="Zachary Seguin" /></router-link>
    </div>
    <!-- Controls -->
    <div class="controls">
      <MediaControls />
    </div>
    <div class="now-playing">
      <NowPlaying />
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
  padding: 8px 5px;
  background: #f8f8f8;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);

  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: space-between;
}
.dark {
  .header {
    background: #333;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);
  }

 .logo img {
    box-shadow: 0px 0px 1px rgba(100, 100, 100, .5);
  }
}

.logo img {
  height: 100%;
  max-height: 50px;
}

.now-playing {
  flex-grow: 2;
}
</style>
