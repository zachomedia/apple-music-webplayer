<template>
  <div>
    <div class="app" v-if="isInitialized">
      <header class="header sticky-top">
        <app-header />

        <!-- Add warning about EME, if not supported -->
        <b-alert variant="warning" :show="!supportsEME && showEMEAlert" dismissible @dismissed="showEMEAlert=false">
          To play music, please install or enable <strong>Encrypted Media Extensions</strong> in your browser.
        </b-alert>
      </header>
      <b-container fluid>
        <b-row>
          <b-col lg="12" class="mt-3" v-if="!isAuthorized">
            <b-alert variant="info" show>
              <b-button variant="primary" @click="authorize()">Sign in</b-button> now for full length tracks and access to your Apple Music library.
            </b-alert>
          </b-col>
        </b-row>
        <b-row>
          <b-col lg="12" v-if="!$route.meta.isLibrary || isAuthorized" class="p-0 m-0">
            <router-view class="p-0 m-0"></router-view>
          </b-col>
          <b-col lg="12" v-else class="mt-4 text-center">
            <i class="fa fa-lock lock" />
            <h2 class="h4 font-weight-bold">Sign in required</h2>
            <p>This page requires access to your Apple Music library.</p>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <div class="loader" v-else>
      <div>
        <p>
          <a href="https://zacharyseguin.ca" target="_blank">
            <img class="logo" src="./assets/icon.svg" alt="Zachary Seguin" />
          </a>
        </p>
        <Loader />
      </div>
    </div>
  </div>
</template>

<script>
import VueRouter from 'vue-router';

// Import components
import Loader from './components/utils/Loader';
import AppHeader from './components/layouts/AppHeader';

// Import state
import { mapState } from 'vuex';

// Import utils
import { formatSeconds } from './utils';

import routes from './routes';
const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  window.scrollTo(0, 0);
  if (to.name === 'library') {
    next({ path: '/', replace: true });
    return;
  }

  if (to.name === 'recommendations') {
    next({ path: '/for-you', replace: true });
    return;
  }

  if (to.meta.title) {
    document.title = to.meta.title + ' | Zachary Seguin Music';
  } else {
    document.title = 'Zachary Seguin Music: an Apple Music web player';
  }
  next();
});

export default {
  name: 'app',
  router,
  components: {
    Loader,
    AppHeader
  },
  filters: {
    formatSeconds
  },
  data () {
    return {
      showEMEAlert: true
    };
  },
  computed: {
    ...mapState({
      isInitialized: state => state.musicKit.isInitialized,
      isAuthorized: state => state.musicKit.isAuthorized,
      supportsEME: state => state.musicKit.supportsEME
    })
  },
  methods: {
    authorize () {
      let instance = window.MusicKit.getInstance();
      instance.authorize();
    }
  }
};
</script>

<style lang="scss">
@import "assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";
@import "~bootstrap/scss/bootstrap.scss";
@use '~bootstrap-vue/dist/bootstrap-vue';

body {
  background: $body-bg;
  color: $body-color;
}
</style>

<style lang="scss" scoped>
@import "assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

.lock {
  font-size: 80px;
  margin-bottom: 10px;
}

.header {
  background: darken($body-bg, 6%);
  border-bottom: 1px solid darken($body-bg, 1%);
}

.loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom:0;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  p {
    text-align: center;
    margin-bottom: 60px;
  }

  .logo {
    max-height: 75px;
    max-width: 75px;
  }

  > div {
    font-size: $h3-font-size;
    padding: 4rem;
    background: $gray-100;
    color: $gray-900;
    border-radius: $border-radius;
    box-shadow: 1px 1px 1px lighten($body-bg, 10%);
  }
}
</style>
