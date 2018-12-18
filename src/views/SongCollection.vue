<template>
  <div class="collection">
    <div v-if="collection">
      <header :style="{
        background: `#${collection.attributes.artwork.bgColor}`,
        color: `#${collection.attributes.artwork.textColor1}`
      }">
        <div class="contents">
          <img v-if="collection.attributes.artwork"
              :src="collection.attributes.artwork | formatArtworkURL(200)"
              alt="" />
          <div>
            <h1 class="h3">{{ collection.attributes.name | decode }}</h1>
            <p v-if="collection.attributes.curatorName || collection.attributes.artistName"
              class="h5"
              :style="{ color: `#${collection.attributes.artwork.textColor2}`}"
              v-html="collection.attributes.curatorName || collection.attributes.artistName">
            </p>

            <p v-if="collection.attributes.description"
              class="d-none d-md-block"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}"
              v-html="collection.attributes.description.standard || collection.attributes.description.short">
            </p>
            <p v-else-if="collection.attributes.editorialNotes"
              class="d-none d-md-block"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}"
              v-html="collection.attributes.editorialNotes.standard || collection.attributes.editorialNotes.short">
            </p>

            <p v-if="collection.attributes.description"
              class="d-block d-md-none"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}"
              v-html="collection.attributes.description.short">
            </p>
            <p v-else-if="collection.attributes.editorialNotes"
              class="d-block d-md-none"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}"
              v-html="collection.attributes.editorialNotes.short">
            </p>

            <p v-if="collection.attributes.lastModifiedDate"
              :style="{ color: `#${collection.attributes.artwork.textColor4}`}">
              Updated {{ collection.attributes.lastModifiedDate | moment('from') }}
            </p>

            <b-button-group class="mt-0 pt-0">
              <b-button @click.prevent="playCollection()" :style="buttonStyle">Play<span v-if="$route.meta.type !== 'station'"> all</span></b-button>
              <b-button v-if="$route.meta.type !== 'station'" @click.prevent="shuffleCollection()" :style="buttonStyle">Shuffle all</b-button>
              <b-button v-if="isAuthorized && !$route.meta.isLibrary" @click.prevent="addToLibrary()" :style="buttonStyle">Add to library</b-button>
            </b-button-group>
          </div>
        </div>
      </header>

      <div class="tracks" v-if="collection.relationships && collection.relationships.tracks">
        <songs :songs="collection.relationships.tracks.data" :isAlbum="collection.type.includes('album')" :loading="loading" />
      </div>

    </div>

    <!-- Show error message if we failed to load -->
    <error-message v-if="error" :error="error" :show="!collection" />

    <loader class="loading" v-if="loading" />
  </div>
</template>

<script>
import Loader from '../components/utils/Loader';
import ErrorMessage from '../components/utils/ErrorMessage';
import Songs from '../components/collections/Songs';
import { formatArtworkURL, setPageTitle, playItem, errorMessage } from '../utils';
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
    buttonStyle () {
      return {
        background: `#${this.collection.attributes.artwork.textColor1}`,
        color: `#${this.collection.attributes.artwork.bgColor}`,
        'border-color': `#${this.collection.attributes.artwork.bgColor}`
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
        this.error = err;
      }

      this.loading = false;
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
</style>
