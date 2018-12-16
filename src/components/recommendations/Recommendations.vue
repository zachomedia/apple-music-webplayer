<template>
  <div class="recommendations">
    <div v-for="(group, indx) in recommendations" :key="indx">
      <h2 v-if="group.attributes.isGroupRecommendation && level === 1" class="h4">{{ title(group) }}</h2>
      <h3 v-else-if="group.attributes.isGroupRecommendation && level === 2" class="h5">{{ title(group) }}</h3>
      <recommendation-group
        v-if="!group.attributes.isGroupRecommendation"
        :level="level + 1"
        :group="group" />
      <recommendations
        v-else
        class="subgroups"
        :level="level + 1"
        :recommendations="group.relationships.recommendations.data" />
    </div>
  </div>
</template>

<script>
import RecommendationGroup from './RecommendationGroup';

export default {
  name: 'Recommendations',
  props: {
    level: {
      type: Number,
      default: 1
    },
    recommendations: Array
  },
  methods: {
    title (group) {
      if (group.attributes.title) {
        return group.attributes.title.stringForDisplay;
      } else if (group.attributes.reason) {
        return group.attributes.reason.stringForDisplay;
      }

      return null;
    }
  },
  components: {
    RecommendationGroup
  }
};
</script>

<style lang="scss" scoped>
.recommendations > div {
  padding: 20px;
  border-radius: 6px;
  flex-grow: 1;
}

.recommendations > div:nth-child(2n) {
  margin-bottom: 20px;

  background: rgba(0, 0, 0, .2);
}

.recommendations > div:last-child {
  border-bottom: none;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
}

.subgroups {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
