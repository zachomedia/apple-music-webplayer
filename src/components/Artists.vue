
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>
    <p class="text-muted">{{ artists.length }} {{ artists.length | pluralize('artist') }}</p>

    <div class="grid">
      <div class="item" v-for="artist in artists" :key="artist.id">
        <router-link :to="{ name: artist.type, params: { id: artist.id } }">
          <span>{{ artist.attributes.name }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Artists',
  props: {
    title: String,
    artists: Array
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      fields: [ ]
    };
  },
  methods: {
    formatArtworkURL: function (url, height, width) {
      return window.MusicKit.formatArtworkURL(url, width, width);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.grid .item {
  width: 200px;
  margin: 5px;
  font-size: 0.9em;
}

</style>
