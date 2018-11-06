
<template>
  <div>
    <h1 v-if="title">{{ title }}</h1>

    <SongCollectionList :items="items" showCount countLabel="item" v-if="items" />
    <Loading message="Loading..." v-if="loading" />
  </div>
</template>

<script>
import Raven from 'raven-js';
import EventBus from '../event-bus';

import SongCollectionList from '../components/SongCollectionList.vue';
import Loading from '../components/Loading.vue';

export default {
  name: 'RecentlyPlayed',
  components: {
    SongCollectionList,
    Loading
  },
  props: {
    title: String
  },
  data: function () {
    let musicKit = window.MusicKit.getInstance();

    return {
      musicKit: musicKit,
      items: null
    };
  },
  methods: {
    fetch: function (offset) {
      if (this.abort) {
        return;
      }

      this.loading = true;

      if (!offset) {
        offset = 0;
      }

      this.musicKit.api.recentPlayed({ offset: offset, limit: 10 })
        .then(r => {
          if (!this.items) {
            this.items = r;
          } else {
            this.items = this.items.concat(r);
          }

          // Pagination is currently broken.
          // if (false && r.length < 10) {
          //  this.fetch(offset + 10);
          // } else {
          this.loading = false;
          // }
        }, err => {
          Raven.captureException(err);

          EventBus.$emit('alert', {
            type: 'danger',
            message: `An unexpected error occurred.`
          });
        });
    }
  },
  created: function () {
    this.fetch();
  },
  destroyed: function () {
    this.abort = true;
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  a:hover {
    text-decoration: none;
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .grid .item {
    width: 200px;
    margin: 5px;
    font-size: 0.9em;
  }

  .item img {
    width: 200px;
    height: 200px;
    border-radius: 4px;
    margin-bottom: 4px;
    box-shadow: 0 0 1px rgba(0, 0, 0, .4);
  }

  .item span {
    display: block;
    padding: 1px 6px;
    color: black;
  }
</style>

<style>
  .song-cell {
    vertical-align: middle !important;
    cursor: pointer;
  }
</style>
