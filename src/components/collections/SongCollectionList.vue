<template>
  <div class="list">
    <div class="items">
      <song-collection-item
        class="item"
        v-for="item in collection"
        :key="item.id"
        :item="item" />
    </div>
  </div>
</template>

<script>
import SongCollectionItem from './SongCollectionItem';

export default {
  name: 'SongCollectionList',
  components: {
    SongCollectionItem
  },
  props: {
    collection: Array
  }
};
</script>

<style lang="scss" scoped>
.items {
  display: flex;
  flex-wrap: wrap;

  .item {
    margin: 20px 0;
    margin-right: 15px;
  }
}
</style>
