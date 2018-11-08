
<template>
  <div v-if="collection">
    <div class="header">
      <img v-if="collection.attributes.artwork"
           :src="collection.attributes.artwork | formatArtworkURL(150)"
           class="pull-left"
           alt="" />
      <div class="info">
        <h1 class="mb-0">{{ collection.attributes.name }}</h1>
        <p class="text-bold text-muted mt-0 pt-0" v-if="collection.attributes.curatorName || collection.attributes.artistName">{{ collection.attributes.curatorName || collection.attributes.artistName }}</p>
        <p v-if="collection.attributes.description">{{ collection.attributes.description.standard }}</p>

        <p class="text-uppercase actions">
          <ul class="list-unstyled">
            <li><a href="#" v-on:click.prevent="play()">Play all</a></li>
            <li><a href="#" v-on:click.prevent="shuffle()">Shuffle all</a></li>
            <li v-if="isAuthorized && !$route.meta.isLibrary"><a href="#" v-on:click.prevent="addToLibrary()">Add to library</a></li>
          </ul>
        </p>
      </div>
    </div>

    <Songs :songs="collection.relationships.tracks.data"
           :isAlbum="collection.type.includes('album')" />
  </div>
  <div v-else>
    <Loading message="Loading..." />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import Songs from '../components/Songs.vue';
import Loading from '../components/Loading.vue';
import {formatArtworkURL, playItem, apiHeaders} from '../utils';

export default {
  name: 'SongCollection',
  filters: {
    formatArtworkURL
  },
  components: {
    Songs,
    Loading
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      isAuthorized: musicKit.isAuthorized,
      collection: null
    };
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    fetch: function () {
      if (this.abort) {
        return;
      }

      this.loading = true;
      this.collection = null;

      let api = this.$route.meta.isLibrary ? this.musicKit.api.library : this.musicKit.api;

      api[this.$route.meta.type](this.$route.params.id).then(r => {
        this.collection = r;

        document.title = this.collection.attributes.name + ' | Zachary Seguin Music';

        // Workaround to load all songs
        let fetchTracks = (url) => {
          fetch('https://api.music.apple.com' + url, { headers: apiHeaders() })
            .then(res => res.json())
            .then(res => {
              this.collection.relationships.tracks.data = this.collection.relationships.tracks.data.concat(res.data);
              if (!this.abort && res.next) {
                fetchTracks(res.next);
              } else {
                this.loading = false;
              }
            });
        };
        if (r.relationships.tracks.next) {
          fetchTracks(r.relationships.tracks.next);
        } else {
          this.loading = false;
        }
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An unexpected error occurred.`
        });
      });
    },
    play: function () {
      playItem(this.collection);
    },
    shuffle: function () {
      // Temporary shuffle implementation until supported in MusicKit JS.
      var tracks = this.collection.relationships.tracks.data.slice();
      tracks.sort(i => 0.5 - Math.random());

      this.musicKit.setQueue({
        items: tracks.map(i => {
          return {
            attributes: i.attributes,
            id: i.id,
            container: {
              id: i.id
            }
          };
        })
      }).then(queue => {
        this.musicKit.play().catch(err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An unexpected error occurred.`
        });
      });
    },
    addToLibrary: function () {
      this.musicKit.api.addToLibrary({
        [this.collection.type]: [ this.collection.id ]
      }).then(() => {
        EventBus.$emit('alert', {
          type: 'success',
          message: `Successfully added "${this.collection.attributes.name}" to your library.`
        });
      }, err => {
        Raven.captureException(err);

        EventBus.$emit('alert', {
          type: 'danger',
          message: `An error occurred while adding "${this.collection.attributes.name}" to your library.`
        });
      });
    }
  },
  created: function () {
    this.onAuthorizationStatusDidChange = e => {
      // This seems to cause issues...
      if (e.authorizationStatus === 3) {
        return;
      }

      this.isAuthorized = this.musicKit.isAuthorized;
    };
    this.musicKit.addEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);

    this.fetch();
  },
  destroyed: function () {
    this.abort = true;

    this.musicKit.removeEventListener(window.MusicKit.Events.authorizationStatusDidChange, this.onAuthorizationStatusDidChange);
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  width: 150px;
  height: 150px;
  border-radius: 4px;
  box-sizing: content-box;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, .4);
  border: 2px solid #fefefe;
}

.info {
  padding-left: 170px;
}

.header {
  overflow: hidden;
  margin-bottom: 10px;
}

.actions li {
  display: inline-block;
}

.actions li::after {
  content: '|';
  padding: 5px;
  color: #333;
}

.actions li:last-child::after {
  content: '';
}
</style>
