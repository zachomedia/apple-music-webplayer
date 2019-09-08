AppHeader<template>
  <div class="header">
    <playback-controls class="playback-controls" />
    <volume-control class="volume-control" />
    <behaviour-controls class="behaviour-controls" />
    <now-playing class="now-playing" />

    <nav class="nav">
      <b-nav>
        <b-nav-item  :to="{ name: 'top-charts', params: { storefront: storefront } }" :exact="true" active-class="active">Top charts</b-nav-item>
        <b-nav-item v-if="isAuthorized" :to="{ name: 'for-you' }" :exact="true" active-class="active">For you</b-nav-item>
        <b-nav-item v-if="isAuthorized" :to="{ name: 'recent' }" active-class="active">Recent</b-nav-item>
        <b-nav-item :to="{ name: 'search', params: { storefront: storefront } }" active-class="active">Search</b-nav-item>
        <b-nav-item-dropdown v-if="isAuthorized"  text="Library" right>
          <b-dropdown-item :to="{ name: 'library-search' }" active-class="active">Search</b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item :to="{ name: 'my-songs' }" :exact="true" active-class="active">Songs</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-albums' }" :exact="true" active-class="active">Albums</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-artists' }" :exact="true" active-class="active">Artists</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-playlists' }" :exact="true" active-class="active">Playlists</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item v-if="!isAuthorized" @click="authorize()">
          <span class="text-primary font-weight-bold">Sign in</span>
        </b-nav-item>
        <b-nav-item-dropdown right text="<i class=fa-icon />" toggle-class="menu-toggle" no-caret>
          <template slot="button-content">
            <i class="fa fa-ellipsis-h" /><span class="sr-only">Other</span>
          </template>
          <b-dropdown-item :to="{ name: 'settings' }" :exact="true" active-class="active">Settings</b-dropdown-item>
          <b-dropdown-divider v-if="isAuthorized"  />
          <b-dropdown-item v-if="isAuthorized" @click="unauthorize()">Sign out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-nav>
    </nav>
  </div>
</template>

<script>
// Import components
import NowPlaying from '../controls/NowPlaying';
import VolumeControl from '../controls/VolumeControl';
import PlaybackControls from '../controls/PlaybackControls';
import BehaviourControls from '../controls/BehaviourControls';

import { mapState } from 'vuex';

export default {
  name: 'AppHeader',
  data () {
    return {
      links: [
        [ { to: 'index', title: 'For You' }, { to: 'recent', title: 'Recent' } ],
        [ { to: 'search', title: 'Search' } ],
        [ { to: 'my-songs', title: 'Songs' }, { to: 'my-albums', title: 'Albums' },
          { to: 'my-artists', title: 'Artists' }, { to: 'my-playlists', title: 'Playlists' } ],
        [ { to: 'settings', title: 'Settings' } ]
      ]
    };
  },
  computed: {
    ...mapState('musicKit', [ 'storefront', 'isAuthorized' ])
  },
  methods: {
    authorize () {
      let instance = MusicKit.getInstance();
      instance.authorize();
    },
    unauthorize () {
      let instance = MusicKit.getInstance();
      instance.unauthorize();
    }
  },
  components: {
    NowPlaying,
    VolumeControl,
    PlaybackControls,
    BehaviourControls
  }
};
</script>

<style lang="scss">
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";
$nav-fg: $gray-500;

.menu-toggle, .menu-toggle:hover, .menu-toggle:focus {
  color: inherit;
  text-decoration: none;
}
.menu-toggle:hover {
  color: lighten($nav-fg, 15%);
}
</style>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

$nav-bg: lighten($gray-900, 2%);
$nav-fg: $gray-500;

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  .now-playing {
    flex: 1;
    background: rgba(100, 100, 100, .1);
    min-width: 350px;
  }

  .volume-control {
    flex: 1;
    min-width: 75px;
    max-width: 125px;
  }

  .song-controls {
    flex: 0;
  }
}

.columns {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  margin: 0;
  padding: 0;
}

.notifications {
  min-width: 100%;
  background: transparent;
}

.nav /deep/ {
  min-width: 100%;
  text-align: center;
  background: $nav-bg;
  color: $nav-fg;
  padding: 0;
  display: flex;
  justify-content: center;
  font-size: 0.9rem;

  .nav-link {
    padding: 0;
    margin: 0.5rem;
  }

  a, a:hover, a:focus, {
    color: inherit;
    text-decoration: none;
  }

  a.primary {
    color: $primary !important;
  }

  a:hover {
    color: lighten($nav-fg, 15%);
  }

  .active {
    color: lighten($nav-fg, 15%) !important;
    font-weight: bold;
  }
}
</style>
