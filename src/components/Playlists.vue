

<template>
  <div>
    <b-list-group>
      <b-list-group-item
        v-for="item in playlists"
        v-bind:key="item.id"
        href="#"
        :to="{ name: item.type, params: { id: item.id } }"
        exact>
        <span class="title">{{ item.attributes.name }}</span>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  name: 'Playlists',
  props: {
    playlists: Array
  }
}
</script>