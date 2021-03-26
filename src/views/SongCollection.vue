<template>
  <div class="collection">
    <div v-if="collection">
      <header :style="{
        background: bgColor,
        color: textColor1
      }">
        <div class="contents">
          <img v-if="collection.attributes.artwork"
              :src="collection.attributes.artwork | formatArtworkURL(200)"
              alt="" />
          <div>
            <h1 class="h3">{{ collection.attributes.name | decode }}</h1>
            <p v-if="collection.attributes.curatorName || collection.attributes.artistName"
              class="h5"
              :style="{ color: textColor2 }"
              v-html="collection.attributes.curatorName || collection.attributes.artistName">
            </p>

            <p v-if="collection.attributes.genreNames"
               :style="{ color: textColor2 }">
              {{ collection.attributes.genreNames.join(', ') }}
            </p>

            <p v-if="collection.attributes.description"
              class="d-none d-md-block"
              :style="{ color: textColor3 }"
              v-html="collection.attributes.description.standard || collection.attributes.description.short">
            </p>
            <p v-else-if="collection.attributes.editorialNotes"
              class="d-none d-md-block"
              :style="{ color: textColor3 }"
              v-html="collection.attributes.editorialNotes.standard || collection.attributes.editorialNotes.short">
            </p>

            <p v-if="collection.attributes.description"
              class="d-block d-md-none"
              :style="{ color: textColor3 }"
              v-html="collection.attributes.description.short">
            </p>
            <p v-else-if="collection.attributes.editorialNotes"
              class="d-block d-md-none"
              :style="{ color: textColor3 }"
              v-html="collection.attributes.editorialNotes.short">
            </p>

            <p v-if="collection.attributes.releaseDate"
              :style="{ color: textColor4 }">
              Released {{ collection.attributes.releaseDate | moment('LL') }}
            </p>

            <p v-if="collection.attributes.lastModifiedDate"
              :style="{ color: textColor4 }">
              Updated {{ collection.attributes.lastModifiedDate | moment('from') }}
            </p>

            <b-button-group class="mt-0 pt-0">
              <b-button @click.prevent="playCollection()" :style="buttonStyle">Play<span v-if="$route.meta.type !== 'station'"> all</span></b-button>
              <b-button v-if="$route.meta.type !== 'station'" @click.prevent="shuffleCollection()" :style="buttonStyle">Shuffle all</b-button>

              <b-dropdown variant="link" no-caret class="no-spacing">
                <template slot="button-content">
                  <i class="fa fa-caret-down" :style="dropdownStyle" />
                </template>

                <b-dropdown-item v-if="isAuthorized && !$route.meta.isLibrary" @click.prevent="addToLibrary()">Add to library</b-dropdown-item>
                <b-dropdown-divider v-if="isAuthorized && !$route.meta.isLibrary" />
                <b-dropdown-item @click.prevent="playNext()">Play next</b-dropdown-item>
                <b-dropdown-item @click.prevent="playLater()">Play later</b-dropdown-item>
              </b-dropdown>
            </b-button-group>

            <b-dropdown variant="link" no-caret v-if="!$route.meta.isLibrary">
              <template slot="button-content">
                <i class="fa fa-share-square-o" :style="buttonLinkStyle"  />
              </template>

              <b-dropdown-item @click.prevent="open(collection.attributes.url)">View on iTunes</b-dropdown-item>
              <b-dropdown-divider />
              <b-dropdown-item @click.prevent="copyLink()">Copy link</b-dropdown-item>
              <b-dropdown-item @click.prevent="copyAppleMusicLink()">Copy Apple Music link</b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </header>

      <div class="tracks" v-if="collection.relationships && collection.relationships.tracks">
        <songs :songs="collection.relationships.tracks.data" :isAlbum="collection.type.includes('album')" :loading="loading" :highlight="$route.query.i" />
      </div>

      <footer class="tracks">
        <p class="text-center" v-if="collection.attributes.copyright">
          {{ collection.attributes.copyright }}
        </p>
      </footer>
    </div>

    <!-- Show error message if we failed to load -->
    <error-message v-if="error" :error="error" :show="!collection" />

    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';

import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import Songs from '../components/collections/Songs';
import { formatArtworkURL, setPageTitle, playItem, errorMessage, trackToMediaItem } from '../utils';
import { mapActions, mapState } from 'vuex';
import he from 'he';

export default {
  name: 'SongCollection',
  components: {
    Loader,
    Songs,
    ErrorMessage
  },
  filters: {
    formatArtworkURL,
    decode (text) {
      return typeof (text) === 'string' ? he.decode(text) : text;
    }
  },
  data () {
    return {
      error: null,
      loading: true,
      collection: null
    };
  },
  computed: {
    ...mapState('musicKit', ['isAuthorized']),
    bgColor () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.bgColor) {
        return `#${this.collection.attributes.artwork.bgColor}`;
      }

      return 'transparent';
    },
    textColor1 () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor1) {
        return `#${this.collection.attributes.artwork.textColor1}`;
      }

      return 'white';
    },
    textColor2 () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor2) {
        return `#${this.collection.attributes.artwork.textColor2}`;
      }

      return '#ccc';
    },
    textColor3 () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor3) {
        return `#${this.collection.attributes.artwork.textColor3}`;
      }

      return '#ccc';
    },
    textColor4 () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor4) {
        return `#${this.collection.attributes.artwork.textColor4}`;
      }

      return '#ccc';
    },
    textColor5 () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor5) {
        return `#${this.collection.attributes.artwork.textColor5}`;
      }

      return '#ccc';
    },
    buttonStyle () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor1) {
        return {
          background: `#${this.collection.attributes.artwork.textColor1}`,
          color: `#${this.collection.attributes.artwork.bgColor}`,
          'border-color': `#${this.collection.attributes.artwork.bgColor}`
        };
      }

      return {
        background: 'white',
        color: 'black',
        'border-color': 'white'
      };
    },
    dropdownStyle () {
      let buttonStyle = Object.assign({}, this.buttonStyle);
      buttonStyle.display = 'block';
      buttonStyle.borderRadius = '0 5px 5px 0';
      buttonStyle.padding = '10px';
      buttonStyle.textDecoration = 'none';
      return buttonStyle;
    },
    buttonLinkStyle () {
      if (this.collection && this.collection.attributes && this.collection.attributes.artwork && this.collection.attributes.artwork.textColor1) {
        return {
          color: `#${this.collection.attributes.artwork.textColor1}`
        };
      }

      return {
        color: 'white'
      };
    }
  },
  watch: {
    '$route': 'fetch'
  },
  methods: {
    ...mapActions('musicKit', [ 'shuffle' ]),
    playCollection () {
      this.shuffle(false);
      playItem(this.collection);
    },
    async playNext () {
      try {
        await this.$store.dispatch('musicKit/playNext', { items: this.collection.relationships.tracks.data.map(i => trackToMediaItem(i)) });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async playLater () {
      try {
        await this.$store.dispatch('musicKit/playLater', { items: this.collection.relationships.tracks.data.map(i => trackToMediaItem(i)) });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    shuffleCollection () {
      this.shuffle(true);
      playItem(this.collection);
    },
    async addToLibrary () {
      try {
        await this.$store.dispatch('musicKit/addToLibrary', { [this.collection.type]: [ this.collection.id ] });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Added to library',
          message: `Successfully added "${this.collection.attributes.name}" to your library.`
        });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async fetch () {
      this.loading = true;
      this.error = null;

      // Load the collection
      try {
        this.collection = await this.$store.getters['musicKit/get'](this.$route.meta.isLibrary, this.$route.meta.type, this.$route.params.id);
        setPageTitle(this.collection.attributes.name);

        // Fetch the rest of the tracks
        if (this.collection.relationships && this.collection.relationships.tracks) {
          var tracksRelationship = this.collection.relationships.tracks;
          while (tracksRelationship.next) {
            tracksRelationship = await this.$store.getters['musicKit/fetch'](tracksRelationship.next);
            this.collection.relationships.tracks.data = this.collection.relationships.tracks.data.concat(tracksRelationship.data);
          }
        }
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.error = err;
      }

      this.loading = false;
    },
    open (url) {
      window.open(url);
    },
    async copy (text) {
      // From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }

      this.$store.dispatch('alerts/add', {
        variant: 'success',
        message: 'Successfully copied'
      });
    },
    async copyLink () {
      await this.copy(window.location.origin + this.$router.resolve({
        name: this.collection.type,
        params: { id: this.collection.id }
      }).href);
    },
    async copyAppleMusicLink () {
      await this.copy(this.collection.attributes.url);
    }
  },
  created () {
    this.fetch();
  }
};
</script>

<style lang="scss" scoped>
header {
  padding: 10px;

  .contents {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 1200px;
    margin: 0 auto;

    img {
      flex: 0;
      border-radius: 4px;
      margin: 10px 0;
      margin-right: 40px;
      box-shadow: 0 0 4px rgba(0, 0, 0, .6);
      width: 200px;
      height: 200px;
      min-width: 200px;
    }

    > div {
      max-width: 65%;
      margin: 10px;
    }
  }
}

.tracks {
  padding: 20px;
  margin: 0 auto;
  max-width: 1200px;
}

.loading {
  margin: 20px;
}

.no-spacing /deep/ button {
  padding: 0;
  margin: 0;
  text-decoration: none;
}

footer {
  color: #aaa;
  font-size: 0.8em;
}
</style>
