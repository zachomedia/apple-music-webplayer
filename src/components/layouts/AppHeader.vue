AppHeader<template>
  <div class="header">
    <playback-controls class="playback-controls" />
    <volume-control class="volume-control" />
    <behaviour-controls class="behaviour-controls" />
    <now-playing class="now-playing" />

    <nav>
      <b-button-group size="sm">
        <b-button :to="{ name: 'index' }" variant="link" :exact="true">For You</b-button>
        <b-button :to="{ name: 'recent' }" variant="link" :exact="true">Recent</b-button>
        <b-button :to="{ name: 'search' }" variant="link" :exact="true">Search</b-button>
        <b-dropdown right size="sm" text="Library" variant="link" toggle-class="menu-toggle">
          <b-dropdown-item :to="{ name: 'my-songs' }" variant="link" :exact="true">Songs</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-albums' }" variant="link" :exact="true">Albums</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-artists' }" variant="link" :exact="true">Artists</b-dropdown-item>
          <b-dropdown-item :to="{ name: 'my-playlists' }" variant="link" :exact="true">Playlists</b-dropdown-item>
        </b-dropdown>
        <b-dropdown right size="sm" text="<i class=fa-icon />" variant="link" toggle-class="menu-toggle" no-caret>
          <template slot="button-content">
            <i class="fa fa-ellipsis-h" /><span class="sr-only">Other</span>
          </template>
          <b-dropdown-item :to="{ name: 'settings' }" variant="link" :exact="true">Settings</b-dropdown-item>
          <b-dropdown-divider />
          <b-dropdown-item>Logout</b-dropdown-item>
        </b-dropdown>
      </b-button-group>
    </nav>
  </div>
</template>

<script>
// Import components
import NowPlaying from '../controls/NowPlaying';
import VolumeControl from '../controls/VolumeControl';
import PlaybackControls from '../controls/PlaybackControls';
import BehaviourControls from '../controls/BehaviourControls';

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

nav {
  min-width: 100%;
  text-align: center;
  background: $nav-bg;
  color: $nav-fg;
  padding: 2px 0;

  a, a:hover, a:focus, {
    color: inherit;
    text-decoration: none;
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
