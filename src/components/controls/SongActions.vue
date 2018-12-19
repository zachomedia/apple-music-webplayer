<template>
  <b-dropdown variant="link" size="sm" no-caret right boundary="window">
    <template slot="button-content">
      <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
    </template>

    <b-dropdown-item-button @click.stop="addToLibrary()" v-if="isAuthorized && !isLibrary">Add to library</b-dropdown-item-button>
    <b-dropdown-item-button @click.stop="goToAlbum()" v-if="song.assets && song.assets[0] && song.assets[0].metadata">Go to album</b-dropdown-item-button>
    <b-dropdown-divider v-if="(isAuthorized && !isLibrary) || (song.assets && song.assets[0] && song.assets[0].metadata)" />
    <b-dropdown-item-button v-if="showQueue" @click.stop="playNext()">Play next</b-dropdown-item-button>
    <b-dropdown-item-button v-if="showQueue" @click.stop="playLater()">Play later</b-dropdown-item-button>
    <b-dropdown-divider  v-if="showQueue && isAuthorized && !isLibrary" />
    <b-dropdown-item-button @click.stop="love()" v-if="isAuthorized && !isLibrary">Love</b-dropdown-item-button>
    <b-dropdown-item-button @click.stop="dislike()" v-if="isAuthorized && !isLibrary">Dislike</b-dropdown-item-button>
  </b-dropdown>
</template>

<script>
import { mapState } from 'vuex';
import { errorMessage, trackToMediaItem } from '../../utils';

export default {
  name: 'SongActions',
  props: {
    song: Object,
    showQueue: Boolean
  },
  computed: {
    ...mapState('musicKit', ['isAuthorized']),
    isLibrary () {
      return this.song.type.indexOf('library-') === 0;
    }
  },
  methods: {
    async addToLibrary () {
      try {
        await this.$store.dispatch('musicKit/addToLibrary', { songs: [ this.song.id ] });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Added to library',
          message: `Successfully added "${this.song.attributes.name}" to your library.`
        });
      } catch (err) {
        console.error(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    goToAlbum () {
      if (this.song.assets && this.song.assets[0].metadata) {
        this.$router.push({
          name: 'albums',
          params: {
            id: this.song.assets[0].metadata.playlistId
          }
        });
      } else {
        this.$store.dispatch('alerts/add', {
          variant: 'danger',
          title: 'Cannot locate album',
          message: `Unable to locate the album for ${this.song.albumName}`
        });
      }
    },
    async playNext () {
      try {
        await this.$store.dispatch('musicKit/playNext', { items: [ trackToMediaItem(this.song) ] });
      } catch (err) {
        console.error(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async playLater () {
      try {
        await this.$store.dispatch('musicKit/playLater', { items: [ trackToMediaItem(this.song) ] });
      } catch (err) {
        console.error(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async love () {
      try {
        await this.$store.dispatch('musicKit/love', this.song);

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Loved',
          message: `Successfully loved "${this.song.attributes.name}".`
        });
      } catch (err) {
        console.error(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async dislike () {
      try {
        await this.$store.dispatch('musicKit/dislike', this.song);

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Disliked',
          message: `Successfully disliked "${this.song.attributes.name}".`
        });
      } catch (err) {
        console.error(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    }
  }
};
</script>
