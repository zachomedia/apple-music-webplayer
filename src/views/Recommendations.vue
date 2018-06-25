

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <!-- Using indx as key instead of r.id because the ids are not always unique -->
    <div v-for="(r, indx) in groups" :key="indx" class="recommendation-group">
      <h2 v-if="(r.attributes.title || {}).stringForDisplay">{{ r.attributes.title.stringForDisplay }}</h2>
      <h3 v-else-if="(r.attributes.reason || {}).stringForDisplay">{{ r.attributes.reason.stringForDisplay }}</h3>
      
      <Recommendations v-if="r.relationships.recommendations" :recommendations="r.relationships.recommendations.data" />
      <SongCollectionList v-else :items="r.relationships.contents.data" />
    </div>

    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import EventBus from '../event-bus';

import SongCollectionList from '../components/SongCollectionList.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'Recommendations',
  props: {
    title: String,
    recommendations: Array
  },
  components: {
    SongCollectionList,
    Loading
  },
  data: function() {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      groups: this.recommendations
    };
  },
  created: function() {
    if (!this.groups) {
      this.loading = true;
      this.musicKit.api.recommendations().then(r => {
        this.groups = r;
        this.loading = false;
      }, err => {
        console.error(err);
      })
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.recommendation-group .recommendation-group {
  margin-left: 20px;
}
</style>
