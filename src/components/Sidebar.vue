
<template>
  <div>
    <b-button-group class="w-100">
      <b-button v-if="isAuthorized"
                variant="outline-primary"
                class="w-50"
                v-on:click.prevent="unauthorize()">Sign out</b-button>
      <b-button v-if="!isAuthorized"
                variant="primary"
                class="w-50"
                v-on:click.prevent="authorize()">Sign in</b-button>
      <b-button :to="{ name: 'settings' }" variant="outline-secondary" class="w-50"><i class="fa fa-gear" /></b-button>
    </b-button-group>

    <!-- Search -->
    <h2 class="text-uppercase text-muted heading">Search</h2>
    <SearchBox />

    <!-- Apple Music -->
    <h2 class="text-uppercase text-muted heading" v-if="isAuthorized">Apple Music</h2>
    <b-list-group class="mb-2">
      <b-list-group-item :to="{ name: 'recommendations' }" v-if="isAuthorized">Recommendations</b-list-group-item>
      <b-list-group-item :to="{ name: 'recently-played' }" v-if="isAuthorized">Recently Played</b-list-group-item>
    </b-list-group>

    <!-- Library -->
    <div v-if="isAuthorized">
      <h2 class="text-uppercase text-muted heading">My Library</h2>
      <b-list-group class="mb-2">
        <b-list-group-item :to="{ name: 'recently-added' }" exact>Recently Added</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-songs' }" exact>Songs</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-albums' }" exact>Albums</b-list-group-item>
        <b-list-group-item :to="{ name: 'my-artists' }" exact>Artists</b-list-group-item>
      </b-list-group>

      <h3 class="text-uppercase text-muted heading">
        Playlists
        <a href="#" v-on:click.prevent="fetch()" class="pull-right">
          <i :class="{ fa: true, 'fa-refresh': true, 'fa-spin': loading }" />
        </a>
      </h3>
      <Playlists :playlists="playlists" />
    </div>
  </div>
</template>

<script>
import Raven from 'raven-js';
import Playlists from './Playlists.vue';
import SearchBox from './SearchBox.vue';
import EventBus from '../event-bus';

export default {
  name: 'Sidebar',
  components: {
    Playlists,
    SearchBox
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      isAuthorized: musicKit.isAuthorized,
      musicKit: musicKit,
      playlists: null
    };
  },
  methods: {
    authorize: function () {
      this.musicKit.authorize();
    },
    unauthorize: function () {
      this.musicKit.unauthorize();

      // If we're on a page that requires authentication,
      // then let's go back to /.
      if (this.$route.meta.isLibrary) {
        this.$router.push('/');
      }
    },
    fetch: function (offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
        this.playlists = null;
      }

      this.musicKit.api.library.playlists(null, { offset: offset, limit: 100 })
        .then(r => {
          if (!this.playlists) {
            this.playlists = r;
          } else {
            this.playlists = this.playlists.concat(r);
          }

          if (r.length !== 0) {
            this.fetch(offset + 100);
          } else {
            this.loading = false;
          }
        }, err => {
          Raven.captureException(err);

          // If we got an access denied, it's likely the user's token has expired.
          if (err.name === window.MusicKit.MKError.ACCESS_DENIED) {
            EventBus.$emit('alert', {
              type: 'danger',
              message: `Unable to load playlists - it is likely that your session has expired. Please sign in again.`
            });

            this.unauthorize();
          }
        });
    }
  },
  created: function () {
    this.onAuthorizationStatusDidChange = e => {
      this.isAuthorized = this.musicKit.isAuthorized;

      if (this.isAuthorized) {
        this.fetch();
      }
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);

    if (this.isAuthorized) {
      this.fetch();
    }
  },
  destroyed: function () {
    this.abort = true;
    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.heading {
  font-weight: normal;
  padding-top: 10px;
}

h2.heading {
  font-size: 18px;
}

h3.heading {
  font-size: 14px;
}

.text-sm {
  font-size: 0.9em;
}

.split {
  display: flex;
}

.split label {
  width: 100%;
}
</style>
