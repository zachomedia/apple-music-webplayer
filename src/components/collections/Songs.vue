<template>
  <div>
    <p class="text-muted">
      <i class="fa fa-spinner fa-spin loading" aria-hidden="true" v-if="loading" /> {{ songs.length }} {{ songs.length | pluralize('song') }} &mdash; {{ duration | humanize }}
    </p>

    <div class="songs">
      <div class="song" v-for="song in songs" :key="song.id" @click="play(song)">
        <div class="artwork" v-if="!isAlbum">
          <lazy-img v-if="song.attributes && song.attributes.artwork"
             :src="song.attributes.artwork | formatArtworkURL(40)" />
          <div class="playing-indicator" v-if="isPlaying(song)">
            <i class="fa fa-volume-up"></i>
          </div>
        </div>
        <div v-if="isAlbum" class="track-number text-muted">
          <div v-if="!isPlaying(song)">
            {{ song.attributes.trackNumber }}
          </div>
          <div v-else>
            <div class="album-playing-indicator">
              <i class="fa fa-volume-up"></i>
            </div>
          </div>
        </div>
        <div class="title-artist">
          <div class="title">
            <p v-if="song.attributes" class="name" :title="song.attributes.name">{{ song.attributes.name }}</p>
            <content-rating :rating="song.attributes.contentRating" class="rating" />
          </div>
          <p v-if="showArtist && song.attributes" class="artist text-muted" :title="song.attributes.artistName">{{ song.attributes.artistName }}</p>
        </div>
        <div class="album text-muted d-none d-sm-block" v-if="!isAlbum">
          {{ song.attributes.albumName }}
        </div>
        <div class="duration">
          {{ song.attributes.durationInMillis | formatMillis }}
        </div>
        <song-actions :song="song" show-queue />
      </div>
    </div>
  </div>
</template>

<script>
import ContentRating from '../utils/ContentRating';
import LazyImg from '../utils/LazyImg';
import SongActions from '../controls/SongActions';

import { formatArtworkURL, formatMillis, humanize, trackToMediaItem } from '../../utils';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Songs',
  props: {
    songs: Array,
    isAlbum: Boolean,
    loading: Boolean
  },
  data () {
    return {
      tableClasses: [ ],
      fields: [ ]
    };
  },
  computed: {
    ...mapState('musicKit', ['nowPlayingItem', 'shuffleMode']),
    duration () {
      return this.songs.reduce((total, song) => total + ((song.attributes || {}).durationInMillis || 0), 0);
    },
    showArtist () {
      const artist =
          this.songs.length > 0 ? this.songs[0].attributes.artistName : '';
      const allArtistsMatch =
          this.songs.every(item => item.attributes.artistName === artist);
      return !(this.isAlbum && allArtistsMatch);
    }
  },
  components: {
    ContentRating,
    LazyImg,
    SongActions
  },
  filters: {
    formatArtworkURL,
    formatMillis,
    humanize
  },
  methods: {
    ...mapActions('musicKit', ['shuffle']),
    async play (item) {
      const instance = window.MusicKit.getInstance();
      let indx = this.songs.indexOf(item);

      try {
        // Disable shuffle, otherwise MusicKit will shuffle the first song too
        let prevShuffleMode = this.shuffleMode === 1;
        this.shuffle(false);

        await instance.setQueue({
          items: this.songs.map(i => trackToMediaItem(i)),
          startPosition: indx
        });

        // Start playback
        instance.player.play();

        // Restore shuffle mode
        this.shuffle(prevShuffleMode);
      } catch (err) {
        console.error(err);
      }
    },
    isPlaying (item) {
      if (!this.nowPlayingItem) {
        return false;
      }

      return item.id === this.nowPlayingItem.id ||
        item.id === this.nowPlayingItem.container.id ||
        item.id === this.nowPlayingItem.sourceId;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/_custom.scss";
@import "~bootswatch/dist/darkly/variables";

$art-radius: 4px;
$art-size: 40px;

.songs {
  .song:hover {
    background: darken($body-bg, 3%);
    cursor: pointer;
  }

  .song:last-child {
    border-bottom: none;
  }

  .song {
    display: flex;
    flex-wrap: nowrap;
    padding: 8px 0;
    border-bottom: 1px solid $table-border-color;
    align-items: center;

    .artwork {
      flex: 0;
      margin: 0 10px;
      width: $art-size;
      height: $art-size;

      img {
        width: $art-size;
        border-radius: $art-radius;
      }
    }

    .track-number, .duration { flex: 0; padding: 0 10px; }
    .track-number { min-width: 40px; text-align: center; }

    .title-artist, .album {
      padding: 0 8px;
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      p {
        padding: 0;
        margin: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .title {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-items: left;

      p.name {
        flex-shrink: 1;
      }

      p.content-rating {
        flex: none;
        align-self: center;
        margin-left: 8px;
      }
    }
  }

  .playing-indicator {
    background-color: rgba(0, 0, 0, .5);
    border-radius: $art-radius;
    color: #fff;
    font-size: 24px;
    height: $art-size;
    line-height: $art-size;
    margin-top: -$art-size;
    position: absolute;
    text-align: center;
    width: $art-size;
  }
  .album-playing-indicator {
    color: #007bff;
    font-size: 20px;
  }
}

.loading {
  color: white;
}
</style>
