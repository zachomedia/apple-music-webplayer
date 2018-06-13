

<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <!-- Using indx as key instead of r.id because the ids are not always unique -->
    <div v-for="(r, indx) in recommendations" :key="indx" class="recommendation-group">
      <h2 v-if="(r.attributes.title || {}).stringForDisplay">{{ r.attributes.title.stringForDisplay }}</h2>
      <h3 v-else-if="(r.attributes.reason || {}).stringForDisplay">{{ r.attributes.reason.stringForDisplay }}</h3>
      
      <Recommendations v-if="r.relationships.recommendations" :recommendations="r.relationships.recommendations.data" />
      <RecommendedItems v-else :items="r.relationships.contents.data" />
    </div>
  </div>
</template>

<script>
import EventBus from '../event-bus';

import RecommendedItems from './RecommendedItems.vue';

export default {
  name: 'Recommendations',
  props: {
    title: String,
    recommendations: Array,
  },
  components: {
    RecommendedItems
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.recommendation-group .recommendation-group {
  margin-left: 20px;
}
</style>
