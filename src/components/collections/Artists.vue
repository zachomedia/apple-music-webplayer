<template>
  <div class="list">
    <router-link :to="{ name: artist.type, params: { id: artist.id } }" v-for="artist in artists" :key="artist.id" class="item">
      <span :title="artist.attributes.name">{{ artist.attributes.name }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Artists',
  props: {
    artists: Array
  }
};
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;

  .item {
    padding: 8px;
    width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
