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
            <h1 class="h3">{{ collection.attributes.name }}</h1>
            <p v-if="collection.attributes.curatorName || collection.attributes.artistName"
              class="h5"
              :style="{ color: `#${collection.attributes.artwork.textColor2}`}">
              {{ collection.attributes.curatorName || collection.attributes.artistName }}
              </p>
            <p v-if="collection.attributes.description"
              class="d-none d-md-block"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}">
              {{ collection.attributes.description.standard || collection.attributes.description.short }}
            </p>
            <p v-if="collection.attributes.description"
              class="d-block d-md-none"
              :style="{ color: `#${collection.attributes.artwork.textColor3}`}">
              {{ collection.attributes.description.short }}
            </p>
            <p v-if="collection.attributes.lastModifiedDate"
              :style="{ color: `#${collection.attributes.artwork.textColor4}`}">
              Updated {{ collection.attributes.lastModifiedDate | moment('from') }}
            </p>

            <b-button-group class="mt-0 pt-0">
              <b-button @click.prevent="playCollection()" :style="buttonStyle">Play all</b-button>
              <b-button @click.prevent="shuffleCollection()" :style="buttonStyle">Shuffle all</b-button>
            </b-button-group>
          </div>
        </div>
      </header>

      <div class="tracks">
        <songs :songs="collection.relationships.tracks.data" :isAlbum="collection.type.includes('album')" />
      </div>
    </div>
  </div>
</template>

<script>
import Songs from '../components/collections/Songs';
import { formatArtworkURL, setPageTitle, playItem, apiHeaders } from '../utils';
import { mapActions } from 'vuex';
export default {
  name: 'SongCollection',
  components: {
    Songs
  },
  filters: {
    formatArtworkURL
  },
  data () {
    return {
      loading: true,
      collection: null
    };
  },
  computed: {
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
    async fetch () {
      // Load MusicKit
      const instance = window.MusicKit.getInstance();

      // Select the appropriate API based on the route's meta information
      const musicKitAPI = this.$route.meta.isLibrary ? instance.api.library : instance.api;

      // Load the collection
      try {
        var collection = await musicKitAPI[this.$route.meta.type](this.$route.params.id);
        setPageTitle(collection.attributes.name);

        // Fetch the rest of the tracks
        var tracks = collection.relationships.tracks.data;
        var tracksRelationship = collection.relationships.tracks;
        while (tracksRelationship.next) {
          var res = await fetch('https://api.music.apple.com' + tracksRelationship.next, { headers: apiHeaders() });
          tracksRelationship = await res.json();
          tracks = tracks.concat(tracksRelationship.data);
        }
        collection.relationships.tracks.data = tracks;

        // Make the collection availabe to the page
        this.collection = collection;
      } catch (err) {
        console.error(err);
      }
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
</style>
