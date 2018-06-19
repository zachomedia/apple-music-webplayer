<!-- TODO: Support loading additional results -->

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <p v-if="Object.keys(results).length === 0">No results</p>

    <div v-if="results.songs && results.songs.data.length > 0">
      <h2>Songs</h2>
      <Songs :songs="results.songs.data" />
    </div>

    <div v-if="results.albums && results.albums.data.length > 0">
      <h2>Albums</h2>
       <RecommendedItems :items="results.albums.data" showCount countLabel="album" />
    </div>

    <div v-if="results.artists && results.artists.data.length > 0">
      <h2>Artists</h2>
      <Artists :artists="results.artists.data" />
    </div>

    <div v-if="results.playlists && results.playlists.data.length > 0">
      <h2>Playlists</h2>
      <RecommendedItems :items="results.playlists.data" showCount countLabel="playlist" />
    </div>
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
