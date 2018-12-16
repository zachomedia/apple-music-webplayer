<template>
  <div class="group">
    <h2 v-if="title(group) && level === 1" class="h4">{{ title(group) }}</h2>
    <h3 v-else-if="title(group) && level === 2" class="h5">{{ title(group) }}</h3>
    <h4 v-else-if="title(group) && level === 3" class="h6">{{ title(group) }}</h4>

    <div class="items">
      <song-collection-item
        class="item"
        v-for="item in group.relationships.contents.data"
        :key="item.id"
        :item="item" />
    </div>
  </div>
</template>

<script>
import SongCollectionItem from '../collections/SongCollectionItem';

export default {
  name: 'RecommendationGroup',
  components: {
    SongCollectionItem
  },
  props: {
    level: {
      type: Number,
      default: 1
    },
    group: Object
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
  }
};
</script>

<style lang="scss" scoped>
.group {
  margin-bottom: 25px;
}

h2, h3, h4 {
  color: #ddd;
  font-weight: bold;
}

.items {
  display: flex;
  flex-wrap: wrap;

  .item {
    margin: 10px 0;
    margin-right: 25px;
  }
}
</style>
