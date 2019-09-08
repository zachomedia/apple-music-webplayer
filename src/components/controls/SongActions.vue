<template>
  <div>
    <b-dropdown variant="link" size="sm" no-caret right boundary="window" v-if="(isAuthorized && !isLibrary) || showQueue || (song.assets && song.assets[0] && song.assets[0].metadata)">
      <template slot="button-content">
        <i class="fa fa-ellipsis-h" /><span class="sr-only">Song actions</span>
      </template>

      <b-dropdown-item-button @click.stop="addToLibrary()" v-if="isAuthorized && !isLibrary">Add to library</b-dropdown-item-button>
      <b-dropdown-item-button @click.stop="showAddToPlaylistPopup()" v-if="isAuthorized">Add to playlist</b-dropdown-item-button>
      <b-dropdown-divider v-if="isAuthorized" />
      <b-dropdown-item-button @click.stop="goToAlbum()" v-if="song.assets && song.assets[0] && song.assets[0].metadata">Go to album</b-dropdown-item-button>
      <b-dropdown-divider v-if="song.assets && song.assets[0] && song.assets[0].metadata" />
      <b-dropdown-item-button v-if="showQueue" @click.stop="playNext()">Play next</b-dropdown-item-button>
      <b-dropdown-item-button v-if="showQueue" @click.stop="playLater()">Play later</b-dropdown-item-button>
      <b-dropdown-divider v-if="showQueue && isAuthorized" />
      <b-dropdown-item-button @click.stop="love()" v-if="isAuthorized">Love</b-dropdown-item-button>
      <b-dropdown-item-button @click.stop="dislike()" v-if="isAuthorized">Dislike</b-dropdown-item-button>
      <b-dropdown-divider v-if="!isLibrary && song.attributes" />
      <b-dropdown-item-button v-if="!isLibrary && song.attributes" @click.stop="copyLink()">Copy link</b-dropdown-item-button>
      <b-dropdown-item-button v-if="!isLibrary && song.attributes && song.attributes.url" @click.stop="copyAppleMusicLink()">Copy Apple Music link</b-dropdown-item-button>
    </b-dropdown>

    <b-modal v-model="showAddToPlaylist" :title='`Add "${song.attributes.name}" to a playlist`' centered hide-footer>
      <error-message :error="playlistsError" v-if="playlistsError" />
      <loader v-else-if="loadingPlaylists" />
      <div v-else>
        <b-list-group>
          <b-list-group-item>
            <b-form v-on:submit.prevent="addToNewPlaylist()">
              <b-form-input type="text"
                            v-model="newPlaylistName"
                            placeholder="New playlist" />
              <b-button type="submit" class="w-100" :disabled="newPlaylistName.trim().length < 1">Add to {{ newPlaylistName || 'new playlist' }}</b-button>
            </b-form>
          </b-list-group-item>
        </b-list-group>
        <b-list-group class="mt-2">
          <b-list-group-item href="#" v-for="playlist in writablePlaylists" :key="playlist.id" @click.stop="addToPlaylist(playlist)">{{ playlist.attributes.name }}</b-list-group-item>
        </b-list-group>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { errorMessage, trackToMediaItem, EventBus } from '../../utils';
import Raven from 'raven-js';
import mergeWith from 'lodash.mergewith';

import Loader from '../utils/Loader';
import ErrorMessage from '../utils/ErrorMessage';

export default {
  name: 'SongActions',
  props: {
    song: Object,
    showQueue: Boolean
  },
  components: {
    Loader,
    ErrorMessage
  },
  data () {
    return {
      showAddToPlaylist: false,
      loadingPlaylists: false,
      playlists: [],
      playlistsError: null,
      newPlaylistName: ''
    };
  },
  computed: {
    ...mapState('musicKit', ['storefront', 'isAuthorized']),
    isLibrary () {
      return this.song.type.indexOf('library-') === 0;
    },
    writablePlaylists () {
      return this.playlists.filter(p => p.attributes.canEdit);
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
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async showAddToPlaylistPopup () {
      this.loadingPlaylists = true;
      this.showAddToPlaylist = true;
      this.playlists = [];

      try {
        let options = { limit: 100 };
        for (var offset = 0, res = null; res === null || res.length !== 0; offset += options.limit) {
          res = await this.$store.getters['musicKit/get'](true, 'playlists', undefined, mergeWith(options, { offset: offset }));
          this.playlists = this.playlists.concat(res);
        }
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.playlistsError = err;
      }

      this.loadingPlaylists = false;
    },
    async addToPlaylist (playlist) {
      this.showAddToPlaylist = false;

      try {
        await this.$store.dispatch('musicKit/addToPlaylist', {
          playlistId: playlist.id,
          items: [
            {
              id: this.song.id,
              type: this.song.type
            }
          ]
        });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Added to playlist',
          message: `Successfully added "${this.song.attributes.name}" to "${playlist.attributes.name}".`
        });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async addToNewPlaylist () {
      this.showAddToPlaylist = false;

      let newPlaylist = this.newPlaylistName.trim();

      try {
        await this.$store.dispatch('musicKit/newPlaylist', {
          name: newPlaylist,
          items: [
            {
              id: this.song.id,
              type: this.song.type
            }
          ]
        });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Added to playlist',
          message: `Successfully added "${this.song.attributes.name}" to "${newPlaylist}".`
        });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }

      this.newPlaylistName = '';
    },
    goToAlbum () {
      if (this.song.assets && this.song.assets[0].metadata) {
        this.$router.push({
          name: 'albums',
          params: {
            storefront: this.storefront,
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
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async playLater () {
      try {
        await this.$store.dispatch('musicKit/playLater', { items: [ trackToMediaItem(this.song) ] });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async love () {
      try {
        await this.$store.dispatch('musicKit/love', this.song);

        EventBus.$emit('song:rated', { id: this.song.id, rating: 1 });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Loved',
          message: `Successfully loved "${this.song.attributes.name}".`
        });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async dislike () {
      try {
        await this.$store.dispatch('musicKit/dislike', this.song);

        EventBus.$emit('song:rated', { id: this.song.id, rating: -1 });

        this.$store.dispatch('alerts/add', {
          variant: 'success',
          title: 'Disliked',
          message: `Successfully disliked "${this.song.attributes.name}".`
        });
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async copy (text) {
      // From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }

      this.$store.dispatch('alerts/add', {
        variant: 'success',
        message: 'Successfully copied'
      });
    },
    async copyLink () {
      // Fetch the song's alubm
      try {
        let songInfo = await this.$store.getters['musicKit/get'](this.song.type.startsWith('library-'), 'song', this.song.id);
        let album = songInfo.relationships.albums.data[0];

        await this.copy(window.location.origin + this.$router.resolve({
          name: album.type,
          params: { id: album.id },
          query: { i: this.song.id }
        }).href);
      } catch (err) {
        console.error(err);
        Raven.captureException(err);
        this.$store.dispatch('alerts/add', errorMessage(err));
      }
    },
    async copyAppleMusicLink () {
      await this.copy(this.song.attributes.url);
    }
  }
};
</script>
