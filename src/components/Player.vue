
<template>
  <b-container fluid>
    <div class="header container-fluid">
      <div align-self="center" class="logo pull-left pl-2">
        <a href="https://zacharyseguin.ca"><img src="../assets/icon.svg" alt="Zachary Seguin" /></a>
      </div>
      <!-- Controls -->
      <div class="controls">
        <b-row>
          <b-col align-self="center" cols="2">
            <MediaControls />
          </b-col> 
          <b-col align-self="center" class="mr-2">
            <NowPlaying />
          </b-col>
        </b-row>
      </div>
    </div>
    <b-row class="main">
      <!-- Sidebar -->
      <b-col>
        <b-button variant="link" v-on:click.prevent="unauthorize()">Sign out of Apple Music</b-button>

        <!-- Search -->
        <h2 class="text-uppercase heading">Search</h2>
        <b-form v-on:submit.prevent="load('search')">
          <b-form-radio-group id="radios2" v-model="search.library" name="radioSubComponent" buttons button-variant="outline-primary" class="mb-1 btn-group-sm w-100">
            <b-form-radio :value="false" class="w-50">Apple Music</b-form-radio>
            <b-form-radio :value="true" class="w-50">Library</b-form-radio>
          </b-form-radio-group>

          <b-form-input id="q" type="text" v-model="search.query" placeholder="Search" />

          <b-button type="submit" class="d-none">Search</b-button>
        </b-form>

        <!-- Apple Music -->
        <h2 class="text-uppercase heading">Apple Music</h2>
        <b-list-group class="mb-2">
          <b-list-group-item href="#" v-on:click.prevent="load('user:recommendations')">Recommendations</b-list-group-item>
        </b-list-group>

        <!-- User library -->
        <h2 class="text-uppercase heading">Library</h2>
        <b-list-group>
          <b-list-group-item href="#" v-on:click.prevent="load('user:albums')">Albums</b-list-group-item>
          <b-list-group-item href="#" v-on:click.prevent="load('user:artists')">Artists</b-list-group-item>
          <b-list-group-item href="#" v-on:click.prevent="load('user:songs')">Songs</b-list-group-item>
        </b-list-group>
        <!-- User playlists -->
        <h3 class="text-uppercase heading">Playlists</h3>
        <Playlists :playlists="userPlaylists" />
      </b-col>
      
      <!-- Main content -->
      <b-col cols="9" v-if="results">
        <div v-if="results.type === 'albums'">
          <Albums :albums="results.albums" title="Albums" />
        </div>
        <div v-else-if="results.type === 'album'">
          <SongCollection :collection="results.album" />
        </div>
        <div v-else-if="results.type === 'artists'">
          <Artists :artists="results.artists" title="Artists" />
        </div>
        <div v-else-if="results.type === 'artist'">
          <Albums :albums="results.artist.relationships.albums.data" :title="results.artist.attributes.name" />
        </div>
        <div v-else-if="results.type === 'songs'">
          <Songs :songs="results.songs" title="Songs" />
        </div>
        <div v-else-if="results.type === 'playlist'">
          <SongCollection :collection="results.playlist" />
        </div>
        <div v-else-if="results.type === 'recommendations'">
          <Recommendations :recommendations="results.recommendations" title="Recommendations" />
        </div>
        <div v-else-if="results.type === 'search'">
          <SearchResults :results="results.results" :title='`Search results for "${results.query}"`' />
        </div>

        <div v-if="loading" class="text-center pt-4">
          <p><i class="fa fa-circle-o-notch fa-spin loading" aria-hidden="true"></i></p>
          <p>Loading</p>
        </div>
      </b-col>
      <b-col cols="9" v-else>
        <div v-if="loading" class="text-center pt-4">
          <p><i class="fa fa-circle-o-notch fa-spin loading" aria-hidden="true"></i></p>
          <p>Loading</p>
        </div>
      </b-col>
    </b-row>
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
</template>

<script>
import EventBus from '../event-bus';
import Playlists from './Playlists.vue';
import NowPlaying from './NowPlaying.vue';
import MediaControls from './MediaControls.vue';
import Albums from './Albums.vue';
import Artists from './Artists.vue';
import Songs from './Songs.vue';
import SongCollection from './SongCollection.vue';
import Recommendations from './Recommendations.vue';
import SearchResults from './SearchResults.vue';

export default {
  name: 'Player',
  props: {
    musicKit: Object,
  },
  data: function() {
    return {
      userPlaylists: [],
      loading: true,
      results: null,
      search: {
        query: "",
        library: false
      }
    }
  },
  methods: {
    load: function(content) {
      var req = {};

      switch (content) {
        case 'user:albums': req = { albums: null };
                           break;

        case 'user:artists': req = { artists: null };
                           break;

        case 'user:songs': req = { songs: null };
                           break;

        case 'user:recommendations': req = { recommendations: null };
                                     break;

        case 'search': req = { search: this.search.query, library: this.search.library };
                       break;
      }

      EventBus.$emit('load', req);
    },
    unauthorize: function() {
      EventBus.$emit('unauthorize');
    }
  },
  created: function() {
    // Application events
    this.onQueue = (descriptor) => {
      this.musicKit.setQueue(descriptor)
        .then(
          (q) => { 
            // Store the sourceId of each item, so we can update the UI as the song plays
            q.items.forEach(i => i.sourceId = i.id);

            this.musicKit.player.changeToMediaItem(q.item(descriptor.startPosition || 0)).catch(
              err => {
                let next = () => {
                  this.musicKit.skipToNextItem().catch(err => next());
                }

                next();
                console.error(err)
              })
          },
          (err) => console.error(err)
        );
    }
    EventBus.$on('queue', this.onQueue);

    this.onLoad = (description) => {
      // Clear previous results
      this.loading = true;
      this.results = null;
      window.scrollTo(0, 0);

      // We have an explicit result to show
      var api = this.musicKit.api.library;

      if (description.library === false) {
        api = this.musicKit.api;
      }

      // User albums
      if ('albums' in description) {
        var albums = [];
        let getAlbums = (start = 0) => {
          api.albums(description.albums, {
            offset: start,
            limit: 100
          }).then((inAlbums) => {
            albums = albums.concat(inAlbums);

            // Set the results, if not already done. Otherwise, update the songs.
            if (!this.results) {
              this.results = {
                type: 'albums',
                albums: albums
              };
            } else {
              this.results.albums = albums;
            }

            if (inAlbums.length == 100) {
              getAlbums(start + 100);
            } else {
              this.loading = false;
            }
            
          });
        };

        getAlbums();
      }
      else if ('artists' in description) {
        var artists = [];
        let getArtists = (start = 0) => {
          api.artists(description.artists, {
            offset: start,
            limit: 100
          }).then((inArtists) => {
            artists = artists.concat(inArtists);

            // Set the results, if not already done. Otherwise, update the songs.
            if (!this.results) {
              this.results = {
                type: 'artists',
                artists: artists
              };
            } else if (this.results.type) {
              this.results.artists = artists;
            }

            if (inArtists.length == 100) {
              getArtists(start + 100);
            } else {
              this.loading = false;
            }
            
          });
        };

        getArtists();
      }
      // User songs
      else if ('songs' in description) {
        var songs = [];
        let getSongs = (start = 0) => {
          api.songs(description.songs, {
            offset: start,
            limit: 100
          }).then((inSongs) => {
            songs = songs.concat(inSongs);

            // Set the results, if not already done. Otherwise, update the songs.
            if (!this.results) {
              this.results = {
                type: 'songs',
                songs: songs
              };
            } else {
              this.results.songs = songs;
            }

            if (inSongs.length == 100) {
              getSongs(start + 100);
            } else {
              this.loading = false;
            }
          });
        };

        getSongs();
      }
      // Album
      else if ('album' in description) {
        api.album(description.album).then(res => {
          this.results = {
            type: 'album',
            album: res
          };

          this.loading = false;
        });
      }
      else if ('artist' in description) {
        api.artist(description.artist, { include: 'albums' }).then(res => {
          this.results = {
            type: 'artist',
            artist: res
          };

          this.loading = false;
        });
      }
      // Playlist
      else if ('playlist' in description) {
        var tracks = [];

        api.playlist(description.playlist).then(res => {
          this.results = {
            type: 'playlist',
            playlist: res
          };

          this.loading = false;
        });
      }
      // Recommendations
      else if ('recommendations' in description) {
        this.musicKit.api.recommendations(description.playlist).then(res => {
          this.results = {
            type: 'recommendations',
            recommendations: res
          };

          this.loading = false;
        });
      }
      // Search
      else if ('search' in description) {
        var types = [ 'songs', 'albums', 'artists', 'playlists' ];

        if (description.library !== false) {
          types = types.map(i => 'library-' + i);
        }

        api.search(description.search, { types: types }).then(res => {
          // Do some cleanup
          for (var key in res) {
            if (key.startsWith('library-')) {
              res[key.replace('library-', '')] = res[key];
              delete(res[key]);
            }
          }

          this.results = {
            type: 'search',
            query: description.search,
            results: res
          };

          this.loading = false;
        })
      }
    }
    EventBus.$on('load', this.onLoad);


    this.mediaPlaybackError = err => {
      console.log(err);
    }
    this.musicKit.addEventListener(window.MusicKit.Events.mediaPlaybackError, this.mediaPlaybackError);

    // Trigger loading recommendations
    if (!this.results) {
      EventBus.$emit('load', { recommendations: null });
    }

    // Load user playlists
    let getPlaylists = (start = 0) => {
      this.musicKit.api.library.playlists(null, {
        offset: start,
        limit: 100
      }).then((playlists) => {
        this.userPlaylists = this.userPlaylists.concat(playlists);

        if (playlists.length == 100) {
          getPlaylists(start + 100);
        } else {
          this.loading = false;
        }
      });
    };

    getPlaylists();
  },
  destroyed: function() {
    EventBus.$off('queue', this.onQueue);
    EventBus.$off('load', this.onLoad);

    this.musicKit.removeEventListener(window.MusicKit.Events.mediaPlaybackError, this.mediaPlaybackError);
  },
  components: {
    Playlists,
    NowPlaying,
    MediaControls,
    Songs,
    Albums,
    Artists,
    SongCollection,
    Recommendations,
    SearchResults
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main {
  padding-top: 100px;
  padding-bottom: 20px;
}

.logo img {
  height: 100%;
  max-height: 50px;
  margin-top: 6px;
}

@media (max-width: 660px) {
  .logo { display: none; }
}

.header {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 100;
  background: #f8f8f8;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, .2);
  padding: 8px 5px;
  overflow: hidden;
  height: 80px;
}

.heading {
  font-weight: normal;
  padding-top: 10px;
  color: #666;
}

h2.heading {
  font-size: 18px;
}

h3.heading {
  font-size: 14px;
}

.controls {
  position: absolute;
  left: 80px;
  right: 0;
}

.text-sm {
  font-size: 0.9em;
}

.loading {
  font-size: 80px;
}
</style>
