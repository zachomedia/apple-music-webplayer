<!-- TODO: Support loading additional results -->

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <p v-if="Object.keys(results).length === 0">No results</p>
    <b-card no-body v-else>
      <b-tabs card v-model="tabIndex">
        <b-tab title="Songs" :disabled="!(results.songs && results.songs.data.length > 0)">
          <Songs :songs="results.songs.data" v-if="results.songs && results.songs.data.length > 0" />
        </b-tab>
        <b-tab title="Albums" :disabled="!(results.albums && results.albums.data.length > 0)">
          <SongCollectionList :items="results.albums.data" showCount countLabel="album" v-if="results.albums && results.albums.data.length > 0" />
        </b-tab>
        <b-tab title="Artists" :disabled="!(results.artists && results.artists.data.length > 0)">
          <Artists :artists="results.artists.data" v-if="results.artists && results.artists.data.length > 0" />
        </b-tab>
        <b-tab title="Playlists" :disabled="!(results.playlists && results.playlists.data.length > 0)">
          <SongCollectionList :items="results.playlists.data" showCount countLabel="playlist" v-if="results.playlists && results.playlists.data.length > 0" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import Artists from './Artists.vue';
import SongCollectionList from './SongCollectionList.vue';
import Songs from './Songs.vue';

export default {
  name: 'SearchResults',
  components: {
    Artists,
    SongCollectionList,
    Songs
  },
  props: {
    title: String,
    results: Object
  },
  data () {
    return {
      tabIndex: parseInt(this.$route.query.t, 10) || 0
    };
  },
  watch: {
    '$route': function () {
      this.tabIndex = parseInt(this.$route.query.t, 10) || 0;
    },
    tabIndex: function () {
      var route = {
        name: this.$route.name,
        params: this.$route.params,
        query: {
          q: this.$route.query.q,
          t: this.tabIndex
        }
      };
      console.log(route);
      this.$router.push(route);
    }
  }
};
</script>
