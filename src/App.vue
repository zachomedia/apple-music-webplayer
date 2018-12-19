<template>
  <div>
    <div class="app" v-if="isInitialized">
      <header class="header sticky-top">
        <app-header />

        <!-- Show any other alerts -->
        <div class="alerts" v-if="alerts.length > 0">
          <b-alert v-for="alert in alerts"
                  :key="alert.id"
                  :variant="alert.variant || 'info'"
                  class="alert"
                  :show="true"
                  dismissible
                  @dismissed="remove(alert.id)">
            <span class="font-weight-bold" v-if="alert.title">{{ alert.title }}: </span>
            {{ alert.message }}
          </b-alert>
        </div>
      </header>
      <!-- Add warning about EME, if not supported -->
      <b-alert variant="warning" :show="!supportsEME && showEMEAlert" dismissible @dismissed="showEMEAlert=false">
        To play music, please install or enable <strong>Encrypted Media Extensions</strong> in your browser.
      </b-alert>

      <b-container fluid>
        <b-row>
          <b-col lg="12" class="m-0 p-0" v-if="!isAuthorized">
            <b-alert variant="info" show class="m-0 no-border">
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
      <b-container tag="footer" class="text-small footer" fluid>
        <b-row>
          <b-col class="text-muted text-center mb-4 mt-2">
            <p class="mb-1 pb-0">Copyright &copy; 2018 &mdash; <a href="https://zacharyseguin.ca" target="_blank">Zachary Seguin</a></p>
            <p>Apple and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries.</p>
            <p>
              If you encounter any issues, have any feedback or feature requests,
              please <a href="https://github.com/zachomedia/apple-music-webplayer/issues" target="_blank">submit an issue on GitHub</a>
              or send an email to <a href="mailto:contact@zacharyseguin.ca">contact@zacharyseguin.ca</a>.
            </p>
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
import { mapState, mapActions } from 'vuex';

// Import utils
import { formatSeconds, formatMillis, formatArtworkURL } from './utils';

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

  if (to.name === 'recently-played' || to.name === 'recently-added') {
    next({ path: '/recent', replace: true });
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
      showEMEAlert: true,
      notification: false,
      notificationTimeout: null
    };
  },
  computed: {
    ...mapState('musicKit', [ 'isInitialized', 'isAuthorized', 'supportsEME', 'nowPlayingItem' ]),
    ...mapState('alerts', [ 'alerts' ]),
    ...mapState('preferences', [ 'showPlaybackNotifications' ])
  },
  watch: {
    nowPlayingItem () {
      // Don't continue if the user chose not to receive notifications.
      // Or the browser doesn't support notifications.
      // Or the item is empty.
      if (!this.showPlaybackNotifications || !('Notification' in window) || !this.nowPlayingItem) {
        return;
      }

      // Request permissions
      window.Notification.requestPermission();

      // Stop if we don't have permission.
      if (window.Notification.permission !== 'granted') {
        return;
      }

      // Close previous notification, if there is one.
      if (this.notification) {
        this.notification.close();
      }

      this.notification = new window.Notification(this.nowPlayingItem.attributes.name, {
        tag: 'currentMediaItem',
        body: `${this.nowPlayingItem.attributes.artistName} (${formatMillis(this.nowPlayingItem.attributes.durationInMillis)})`,
        icon: this.nowPlayingItem.attributes.artwork ? formatArtworkURL(this.nowPlayingItem.attributes.artwork) : null
      });

      this.notification.onclose = evt => {
        this.notification = null;
        clearTimeout(this.notificationTimeout);
      };

      this.notificationTimeout = setTimeout(evt => {
        if (this.notification) {
          this.notification.close();
        }
      }, this.nowPlayingItem.durationInMillis);
    }
  },
  methods: {
    ...mapActions('alerts', [ 'remove' ]),
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

.br-0 {
  border-radius: 0;
}

.text-small {
  font-size: 0.8rem;
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

.no-border {
  border-radius: 0;
}

.alerts {
  min-width: 100%;
  background: $body-bg;

  .alert {
    border-radius: 0;
    margin: 0;
  }
}

.footer {
  padding-top: 20px;
  background: darken($body-bg, 3%);
  border-top: 1px solid darken($body-bg, 5%);
}
</style>
