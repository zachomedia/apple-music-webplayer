<template>
  <div :class="theme">
    <!-- Alert -->
    <b-alert v-if="alert.details"
            class="alert"
            :show="alert.countdown"
            dismissible
            fade
            :variant="alert.details.type"
            @dismissed="alert.countdown=0"
            @dismiss-count-down="alertCountdownChanged">
      {{alert.details.message}}
    </b-alert>

    <div id="app" v-if="musicKit">
      <!-- Header -->
      <Header />

      <b-container fluid>
        <b-row>
          <b-col lg="3" class="mb-4">
            <b-button :class="{ 'w-100 d-sm-block d-md-block d-lg-none d-xl-none': true, 'mb-4': showSidebar }" @click="showSidebar = !showSidebar">
              <i :class="{ 'fa': true, 'fa-bars': !showSidebar, 'fa-times': showSidebar }" /> Menu
            </b-button>
            <Sidebar :class="{ 'd-none': !showSidebar, 'd-sm-none': !showSidebar, 'd-md-none': !showSidebar, 'd-lg-block': true, 'd-xl-block': true }" />
          </b-col>
          <b-col lg="9">
            <router-view></router-view>
          </b-col>
        </b-row>
      </b-container>
    </div>
    <!-- Waiting for MusicKit -->
    <div id="app" v-else>
      <Header>
        <template slot="controls">
          <b-col class="text-center pt-2">
            <i class="fa fa-circle-o-notch fa-spin h2" style="font-size: 20px" aria-hidden="true" />
            <p>Initializing MusicKit JS...</p>
          </b-col>
        </template>
      </Header>

      <b-container fluid>
        <b-row>
          <b-col sm="12">
            <Index />
          </b-col>
        </b-row>
      </b-container>
    </div>

    <b-container fluid>
      <b-row>
        <b-col class="text-muted text-center text-sm mb-4 mt-2">
          <p class="mb-1 pb-0">Copyright &copy; 2018 &mdash; <a href="https://zacharyseguin.ca">Zachary Seguin</a></p>
          <p>Apple and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries</p>
          <p>
            If you encounter any issues, have any feedback or feature requests, 
            please <a href="https://github.com/zachomedia/apple-music-webplayer/issues">submit an issue on GitHub</a>
            or send an email to <a href="mailto:contact@zacharyseguin.ca">contact@zacharyseguin.ca</a>.
          </p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import VueRouter from 'vue-router';

  // Import private configuration
  import privateConfig from './private';

  // Event bus
  import EventBus from './event-bus';

  // Import custom controls
  import Header from './components/Header.vue';
  import Index from './views/Index.vue';
  import Loading from './components/Loading.vue';
  import Sidebar from './components/Sidebar.vue';
  import Recommendations from './views/Recommendations.vue';
  import SongCollection from './views/SongCollection.vue';
  import MyAlbums from './views/MyAlbums.vue';
  import MySongs from './views/MySongs.vue';
  import MyArtists from './views/MyArtists.vue';
  import Artist from './views/Artist.vue';
  import Search from './views/Search.vue';
  import Me from './views/Me.vue';
  import NotFound from './views/NotFound.vue';
  import Settings from './views/Settings.vue';
  import Debug from './views/Debug.vue';

  import moment from 'moment';

  // Initialize router
  const routes = [
    { 
      name: 'index',
      path: '/',
      component: Index
    },
    {
      name: 'search',
      path: '/search',
      component: Search,
      props: {
        title: 'Search'
      },
      meta: {
        title: 'Search'
      }
    },
    { 
      name: 'recommendations',
      path: '/recommendations',
      component: Recommendations,
      props: {
        title: 'Recommendations'
      },
      meta: {
        title: 'Recommendations',
        isLibrary: true
      }
    },
    {
      name: 'library',
      path: '/library',
      component: Me,
      meta: {
        isLibrary: true
      },
      children: [
        {
          name: 'library-search',
          path: 'search',
          component: Search,
          props: {
            title: 'Search library'
          },
          meta: {
            title: 'Search library',
            isLibrary: true
          }
        },
        {
          name: 'my-songs',
          path: 'songs',
          component: MySongs,
          props: {
            title: 'My songs'
          },
          meta: {
            title: 'My songs',
            isLibrary: true
          }
        },
        {
          name: 'my-albums',
          path: 'albums',
          component: MyAlbums,
          props: {
            title: 'My albums'
          },
          meta: {
            title: 'My albums',
            isLibrary: true
          }
        },
        {
          name: 'library-albums',
          path: 'albums/:id',
          component: SongCollection,
          meta: {
            type: 'album',
            isLibrary: true
          }
        },
        {
          name: 'library-playlists',
          path: 'playlists/:id',
          component: SongCollection,
          meta: {
            type: 'playlist',
            isLibrary: true
          }
        },
        {
          name: 'my-artists',
          path: 'artists',
          component: MyArtists,
          props: {
            title: 'My artists'
          },
          meta: {
            title: 'My artists',
            isLibrary: true
          }
        },
        {
          name: 'library-artists',
          path: 'artists/:id',
          component: Artist,
          meta: {
            isLibrary: true
          }
        }
      ]
    },
    {
      name: 'playlists',
      path: '/playlists/:id',
      component: SongCollection,
      meta: {
        type: 'playlist',
        isLibrary: false
      }
    },
    {
      name: 'albums',
      path: '/albums/:id',
      component: SongCollection,
      meta: {
        type: 'album',
        isLibrary: false
      }
    },
    {
      name: 'artists',
      path: '/artists/:id',
      component: Artist,
      meta: {
        isLibrary: false
      }
    },
    {
      name: 'settings',
      path: '/settings',
      component: Settings,
      meta: {
        title: 'Settings',
        isLibrary: false
      },
      props: {
        title: 'Settings'
      }
    },
    {
      name: 'debug',
      path: '/debug',
      component: Debug,
      meta: {
        title: 'Debug',
        isLibrary: false
      },
      props: {
        title: 'Debug'
      }
    },
    {
      path: '*',
      component: NotFound,
      meta: {
        title: 'Not found'
      }
    }
  ];

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

    if (to.meta.title) {
      document.title = to.meta.title + ' | Zachary Seguin Music';
    } else {
      document.title = 'Zachary Seguin Music: an Apple Music web player';
    }

    try {
      let musicKit = window.MusicKit.getInstance();

      if (to.meta.isLibrary && !musicKit.isAuthorized) {
        next({ path: '/', replace: true });
        return;
      }
    } catch (err) {
      // Do nothing
    }
    
    next();
  });

  export default {
    router,
    name: 'app',
    components: {
      Header,
      Index,
      Loading,
      Sidebar
    },
    localStorage: {
      theme: {
        type: String,
        default: 'light'
      },
      showPlaybackNotifications: {
        type: Boolean,
        default: true
      }
    },
    data: function() {
      return {
        theme: this.$localStorage.get('theme'),
        showSidebar: true,

        musicKit: null,
        alert: {
          details: null,
          countdown: 0
        }
      };
    },
    watch: {
      '$route': function() {
        // If the route changes, hide the sidebar
        console.log('route changed');
        this.showSidebar = false; 
      },
    },
    methods: {
      formatDuration: function(value, unit) {
         let pad = function(num) {
            if (num < 10) {
               num = "0" + num;
            }

            return num;
         };

         let m = moment.duration(value, unit);

         return m.minutes() + ":" + pad(m.seconds());
      },
      alertCountdownChanged: function(count) {
        this.alert.countdown = count;
      }
    },
    created: function() {
      this.onThemeChange = () => {
        this.theme = this.$localStorage.get('theme');
        document.body.className = this.theme;
      }
      EventBus.$on('theme', this.onThemeChange);
      this.onThemeChange();

      // Events
      this.onAlert = (alert) => {
        this.alert.details = alert;
        this.alert.countdown = 5;
      }
      EventBus.$on('alert', this.onAlert);

      let initializeMusicKit = () => {
        // Configure MusicKit
        window.MusicKit.configure({
          developerToken: privateConfig.developerToken,
          app: {
            name: 'Zachary Seguin Music',
            build: '0.1.0'
          }
        });

        let musicKit = window.MusicKit.getInstance();

        if (!musicKit.isAuthorized && this.$route.meta.isLibrary) {
          this.$router.push({ path: '/', replace: true });
        }

        this.musicKit = musicKit;

        // Create callback functions
        this.mediaPlaybackError = (event) => {
          console.error(event);
        };
        this.musicKit.addEventListener(window.MusicKit.Events.mediaPlaybackError, this.mediaPlaybackError);

        this.mediaItemDidChange = (event) => {
          // Show a notification
          if (('Notification' in window) && event.item && this.$localStorage.get('showPlaybackNotifications')) {
            window.Notification.requestPermission();

            if (window.Notification.permission === "granted") {
              if (this.notification) {
                this.notification.close();
              }

              this.notification = new window.Notification(event.item.attributes.name, {
                tag: 'currentMediaItem',
                body: event.item.attributes.artistName + " (" + this.formatDuration(event.item.attributes.durationInMillis) + ")",
                icon: event.item.attributes.artwork ? window.MusicKit.formatArtworkURL(event.item.attributes.artwork) : null
              });

              this.notification.onclose = e => {
                this.notification = null;
                clearTimeout(this.notificationTimeout);
              }

              this.notificationTimeout = setTimeout(e => {
                if (this.notification) {
                  this.notification.close();
                }
              }, event.item.attributes.durationInMillis);
            }
          }
        };
        this.musicKit.addEventListener(window.MusicKit.Events.mediaItemDidChange, this.mediaItemDidChange);
      }

      // Check for MusicKit
      if (window.MusicKit) {
        try {
          this.musicKit = window.MusicKit.getInstance();
        } catch (err) {
          initializeMusicKit();
        }
      } else {
        document.addEventListener('musickitloaded', () => {
          initializeMusicKit();
        });
      }
    },
    destroyed: function() {
      EventBus.$off('theme', this.onThemeChange);
      EventBus.$off('alert', this.onAlert);
    }
  };
</script>

<style>
#app {
  font-size: 0.9rem;
  padding-top: 100px;
}
</style>

<style scoped>
.alert {
  position: fixed !important;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}

.text-sm {
  font-size: 0.8em;
}
</style>

<style lang="scss">
body {
  font-family: sans-serif;
}

body.light {
  // Default light mode
  @import "assets/_custom.scss";
  @import "~bootstrap/scss/bootstrap.scss";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';

  background: $body-bg;
  color: $body-color;
}

// Colours for dark mode
body.dark {
  @import "assets/_custom.dark.scss";
  @import "~bootswatch/dist/darkly/variables";
  @import "~bootstrap/scss/bootstrap.scss";
  @import "~bootswatch/dist/darkly/bootswatch";
  @import '~bootstrap-vue/dist/bootstrap-vue.css';

  background: $body-bg;
  color: $body-color;
}

body.modal-open {
  overflow: hidden;

  .modal {
    overflow-x: hidden;
    overflow-y: scroll;
  }
}
</style>
