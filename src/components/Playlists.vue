

<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="item in playlists"
        v-bind:key="item.id"
        href="#"
        v-on:click.prevent="load(item)">
        <span class="title">{{ item.attributes.name }}</span>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import EventBus from '../event-bus';

export default {
  name: 'Playlists',
  props: {
    playlists: Array,
  },
  methods: {
    load: function(item) {
      EventBus.$emit('load', { playlist: item.id });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
