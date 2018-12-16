<template>
  <div>
    <ForYou v-if="isAuthorized" />
    <div v-else class="warning">
      <h1 class="sr-only">Zachary Seguin Music: an Apple Music web player</h1>

      <p class="h3">Hello!</p>
      <p>This is a web player for <a href="https://applemusic.com" target="_blank">Apple Music</a>,
      built using <a href="https://developer.apple.com/documentation/musickitjs">MusicKit JS</a>.</p>

      <b-alert show variant="warning">
        <p class="h4 text-uppercase">Notice</p>
        <p>This application is build using an API that is currently in beta.</p>
      </b-alert>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ForYou from './ForYou';

export default {
  name: 'Index',
  components: {
    ForYou
  },
  computed: {
    ...mapState('musicKit', ['isAuthorized'])
  }
};
</script>

<style lang="scss" scoped>
.loading {
  margin-top: 40px;
}

.warning {
  padding: 40px;
}
</style>
