<!-- TODO: Support loading additional results -->

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <p v-if="Object.keys(results).length === 0">No results</p>
    <b-card no-body v-else>
      <b-tabs card>
        <b-tab title="Songs" active v-if="results.songs && results.songs.data.length > 0">
          <Songs :songs="results.songs.data" />
        </b-tab>
        <b-tab title="Albums" v-if="results.albums && results.albums.data.length > 0">
          <RecommendedItems :items="results.albums.data" showCount countLabel="album" />
        </b-tab>
        <b-tab title="Artists" v-if="results.artists && results.artists.data.length > 0">
          <Artists :artists="results.artists.data" />
        </b-tab>
        <b-tab title="Playlists" v-if="results.playlists && results.playlists.data.length > 0">
          <RecommendedItems :items="results.playlists.data" showCount countLabel="playlist" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import EventBus from '../event-bus';
import Artists from './Artists.vue';
import RecommendedItems from './RecommendedItems.vue';
import Songs from './Songs.vue';

export default {
  name: 'SearchResults',
  props: {
    title: String,
    results: Object,
  },
  components: {
    Artists,
    RecommendedItems,
    Songs
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
